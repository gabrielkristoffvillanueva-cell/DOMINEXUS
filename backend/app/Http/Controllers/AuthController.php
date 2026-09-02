<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Meeting;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | STUDENT REGISTRATION
    |--------------------------------------------------------------------------
    */

    public function register(Request $request)
    {
        $validated = $request->validate([

            'name' => [
                'required',
                'string',
                'max:255'
            ],

            'student_id' => [
                'required',
                'string',
                'max:255',
                'unique:users,student_id'
            ],

            'section' => [
                'required',
                'string',
                'max:255'
            ],

            'club_role' => [
                'required',
                'string',
                'max:255'
            ],

            'password' => [
                'required',
                'string',
                'min:6'
            ],

            'organization_id' => [
                'required',
                'integer',
                'exists:organizations,id'
            ],

            'digital_signature' => [
                'nullable',
                'string'
            ],

        ]);


        $uniqueId =
            'SDCA-' .
            random_int(100000, 999999);


        while (
            User::where(
                'unique_id',
                $uniqueId
            )->exists()
        ) {

            $uniqueId =
                'SDCA-' .
                random_int(100000, 999999);

        }


        $user = User::create([

            'name' =>
                $validated['name'],

            'student_id' =>
                $validated['student_id'],

            'section' =>
                $validated['section'],

            'club_role' =>
                $validated['club_role'],

            'password' =>
                Hash::make(
                    $validated['password']
                ),

            'organization_id' =>
                $validated['organization_id'],

            'digital_signature' =>
                $validated['digital_signature'] ?? null,

            'unique_id' =>
                $uniqueId,

            'role' =>
                'student',

            'status' =>
                'Active',

            'password_reset_required' =>
                false,

            'email' =>
                null,

        ]);


        return response()->json([

            'message' =>
                'Student registered successfully.',

            'user' =>
                $user->load('organization'),

        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | STUDENT LOGIN
    |--------------------------------------------------------------------------
    */

    public function login(Request $request)
    {
        $credentials = $request->validate([

            'student_id' => [
                'required',
                'string'
            ],

            'password' => [
                'required',
                'string'
            ],

        ]);


        /*
        |--------------------------------------------------------------------------
        | FIND STUDENT
        |--------------------------------------------------------------------------
        */

        $user =
            User::where(
                'student_id',
                $credentials['student_id']
            )
            ->where(
                'role',
                'student'
            )
            ->first();


        /*
        |--------------------------------------------------------------------------
        | CHECK STUDENT + PASSWORD
        |--------------------------------------------------------------------------
        */

        if (
            !$user ||
            !Hash::check(
                $credentials['password'],
                $user->password
            )
        ) {

            return response()->json([

                'message' =>
                    'Invalid Student ID or password.'

            ], 401);

        }


        /*
        |--------------------------------------------------------------------------
        | TEMPORARY PASSWORD CHECK
        |--------------------------------------------------------------------------
        */

        if (
            $user->password_reset_required
        ) {

            return response()->json([

                'message' =>
                    'Password change required.',

                'must_change_password' =>
                    true,

                'user' => [

                    'id' =>
                        $user->id,

                    'name' =>
                        $user->name,

                    'student_id' =>
                        $user->student_id,

                    'unique_id' =>
                        $user->unique_id,

                    'section' =>
                        $user->section,

                    'club_role' =>
                        $user->club_role,

                    'role' =>
                        $user->role,

                    'status' =>
                        $user->status,

                    'organization_id' =>
                        $user->organization_id,

                    'organization' =>
                        $user->organization,

                ],

            ]);

        }


        /*
        |--------------------------------------------------------------------------
        | NORMAL LOGIN
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'message' =>
                'Login successful.',

            'user' =>
                $user->load('organization'),

        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | FIND STUDENT BY STUDENT ID
    |--------------------------------------------------------------------------
    */

    public function findStudentByStudentId(
        $studentId
    ) {

        $student =
            User::where(
                'student_id',
                $studentId
            )
            ->where(
                'role',
                'student'
            )
            ->with('organization')
            ->first();


        if (!$student) {

            return response()->json([

                'message' =>
                    'Student not found.'

            ], 404);

        }


        return response()->json([

            'student' =>
                $student

        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | STUDENT CHANGE PASSWORD
    |--------------------------------------------------------------------------
    */

    public function changePassword(
        Request $request
    ) {

        $validated = $request->validate([

            'student_id' => [
                'required',
                'string'
            ],

            'new_password' => [
                'required',
                'string',
                'min:8'
            ],

        ]);


        /*
        |--------------------------------------------------------------------------
        | FIND STUDENT
        |--------------------------------------------------------------------------
        */

        $student =
            User::where(
                'student_id',
                $validated['student_id']
            )
            ->where(
                'role',
                'student'
            )
            ->first();


        if (!$student) {

            return response()->json([

                'message' =>
                    'Student account not found.'

            ], 404);

        }


        /*
        |--------------------------------------------------------------------------
        | SAVE NEW PASSWORD
        |--------------------------------------------------------------------------
        */

        $student->password =
            Hash::make(
                $validated['new_password']
            );


        /*
        |--------------------------------------------------------------------------
        | REMOVE TEMPORARY PASSWORD STATUS
        |--------------------------------------------------------------------------
        */

        $student->password_reset_required =
            false;


        $student->save();


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'message' =>
                'Password changed successfully.'

        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | OFFICER LOGIN
    |--------------------------------------------------------------------------
    */

    public function officerLogin(
        Request $request
    ) {

        $credentials = $request->validate([

            'officer_id' => [
                'required',
                'string'
            ],

            'password' => [
                'required',
                'string'
            ],

        ]);


        $officer =
            User::where(
                'student_id',
                $credentials['officer_id']
            )
            ->where(
                'role',
                'officer'
            )
            ->first();


        if (!$officer) {

            return response()->json([

                'message' =>
                    'Invalid Officer ID or password.'

            ], 401);

        }


        if (
            !Hash::check(
                $credentials['password'],
                $officer->password
            )
        ) {

            return response()->json([

                'message' =>
                    'Invalid Officer ID or password.'

            ], 401);

        }


        if (
            $officer->status ===
            'Pending'
        ) {

            return response()->json([

                'message' =>
                    'Your Officer account is still pending approval. Please wait for the Moderator to approve your application.'

            ], 403);

        }


        if (
            $officer->status ===
            'Rejected'
        ) {

            return response()->json([

                'message' =>
                    'Your Officer application has been rejected. Please contact the Moderator for more information.'

            ], 403);

        }


        if (
            $officer->status !==
            'Active'
        ) {

            return response()->json([

                'message' =>
                    'Your Officer account is not active.'

            ], 403);

        }


        return response()->json([

            'message' =>
                'Officer login successful.',

            'user' =>
                $officer->load('organization'),

        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | OFFICER REGISTRATION
    |--------------------------------------------------------------------------
    */

    public function officerRegister(
        Request $request
    ) {

        $validated = $request->validate([

            'name' => [
                'required',
                'string',
                'max:255'
            ],

            'officer_id' => [
                'required',
                'string',
                'max:255',
                'unique:users,student_id'
            ],

            'section' => [
                'required',
                'string',
                'max:255'
            ],

            'organization_id' => [
                'required',
                'integer',
                'exists:organizations,id'
            ],

            'club_role' => [
                'required',
                'string',
                'max:255'
            ],

            'password' => [
                'required',
                'string',
                'min:8'
            ],

        ]);


        $uniqueId =
            'OFF-' .
            random_int(100000, 999999);


        while (
            User::where(
                'unique_id',
                $uniqueId
            )->exists()
        ) {

            $uniqueId =
                'OFF-' .
                random_int(100000, 999999);

        }


        $officer = User::create([

            'name' =>
                $validated['name'],

            'student_id' =>
                $validated['officer_id'],

            'section' =>
                $validated['section'],

            'club_role' =>
                $validated['club_role'],

            'password' =>
                Hash::make(
                    $validated['password']
                ),

            'organization_id' =>
                $validated['organization_id'],

            'digital_signature' =>
                null,

            'unique_id' =>
                $uniqueId,

            'role' =>
                'officer',

            'status' =>
                'Pending',

            'password_reset_required' =>
                false,

            'email' =>
                null,

        ]);


        return response()->json([

            'message' =>
                'Officer application submitted successfully. Your account is pending approval.',

            'officer' =>
                $officer->load('organization'),

        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | MODERATOR LOGIN
    |--------------------------------------------------------------------------
    */

    public function moderatorLogin(
        Request $request
    ) {

        $credentials = $request->validate([

            'moderator_id' => [
                'required',
                'string'
            ],

            'password' => [
                'required',
                'string'
            ],

        ]);


        $moderator =
            User::where(
                'student_id',
                $credentials['moderator_id']
            )
            ->where(
                'role',
                'moderator'
            )
            ->where(
                'status',
                'Active'
            )
            ->with('organization')
            ->first();


        if (
            !$moderator ||
            !Hash::check(
                $credentials['password'],
                $moderator->password
            )
        ) {

            return response()->json([

                'message' =>
                    'Invalid Moderator ID or password.'

            ], 401);

        }


        return response()->json([

            'message' =>
                'Moderator login successful.',

            'user' =>
                $moderator,

        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | GET PENDING OFFICER APPLICATIONS
    |--------------------------------------------------------------------------
    */

    public function officerApplications(
        Request $request
    ) {

        $validated = $request->validate([

            'moderator_id' => [
                'required',
                'string'
            ],

        ]);


        $moderator =
            User::where(
                'student_id',
                $validated['moderator_id']
            )
            ->where(
                'role',
                'moderator'
            )
            ->where(
                'status',
                'Active'
            )
            ->first();


        if (!$moderator) {

            return response()->json([

                'message' =>
                    'Unauthorized moderator access.'

            ], 403);

        }


        $applications =
            User::where(
                'role',
                'officer'
            )
            ->where(
                'status',
                'Pending'
            )
            ->where(
                'organization_id',
                $moderator->organization_id
            )
            ->with('organization')
            ->latest()
            ->get();


        return response()->json([

            'applications' =>
                $applications

        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | APPROVE OFFICER
    |--------------------------------------------------------------------------
    */

    public function approveOfficer(
        Request $request,
        $id
    ) {

        $moderator =
            User::where(
                'student_id',
                $request->moderator_id
            )
            ->where(
                'role',
                'moderator'
            )
            ->where(
                'status',
                'Active'
            )
            ->first();


        if (!$moderator) {

            return response()->json([

                'message' =>
                    'Unauthorized moderator access.'

            ], 403);

        }


        $officer =
            User::where(
                'id',
                $id
            )
            ->where(
                'role',
                'officer'
            )
            ->where(
                'status',
                'Pending'
            )
            ->where(
                'organization_id',
                $moderator->organization_id
            )
            ->first();


        if (!$officer) {

            return response()->json([

                'message' =>
                    'Officer application not found.'

            ], 404);

        }


        $officer->status =
            'Active';


        $officer->save();


        return response()->json([

            'message' =>
                'Officer application approved successfully.',

            'officer' =>
                $officer->load('organization'),

        ]);
    }


    /*
|--------------------------------------------------------------------------
| REJECT OFFICER
|--------------------------------------------------------------------------
*/

public function rejectOfficer(
    Request $request,
    $id
) {

    /*
    |--------------------------------------------------------------------------
    | VALIDATE MODERATOR ID
    |--------------------------------------------------------------------------
    */

    $validated = $request->validate([

        'moderator_id' => [
            'required',
            'string'
        ],

    ]);


    /*
    |--------------------------------------------------------------------------
    | FIND ACTIVE MODERATOR
    |--------------------------------------------------------------------------
    */

    $moderator =
        User::where(
            'student_id',
            $validated['moderator_id']
        )
        ->where(
            'role',
            'moderator'
        )
        ->where(
            'status',
            'Active'
        )
        ->first();


    if (!$moderator) {

        return response()->json([

            'message' =>
                'Unauthorized moderator access.'

        ], 403);

    }


    /*
    |--------------------------------------------------------------------------
    | FIND PENDING OFFICER
    |
    | IMPORTANT:
    | The officer MUST belong to the same organization
    | as the moderator.
    |--------------------------------------------------------------------------
    */

    $officer =
        User::where(
            'id',
            $id
        )
        ->where(
            'role',
            'officer'
        )
        ->where(
            'status',
            'Pending'
        )
        ->where(
            'organization_id',
            $moderator->organization_id
        )
        ->first();


    if (!$officer) {

        return response()->json([

            'message' =>
                'Officer application not found.'

        ], 404);

    }


    /*
    |--------------------------------------------------------------------------
    | REJECT OFFICER
    |--------------------------------------------------------------------------
    */

    $officer->status =
        'Rejected';


    $officer->save();


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return response()->json([

        'message' =>
            'Officer application rejected.',

        'officer' =>
            $officer->load('organization'),

    ]);

}

    /*
    |--------------------------------------------------------------------------
    | MODERATOR DASHBOARD
    |--------------------------------------------------------------------------
    */

    public function moderatorDashboard(
        Request $request
    ) {

        $moderator =
            User::where(
                'student_id',
                $request->moderator_id
            )
            ->where(
                'role',
                'moderator'
            )
            ->where(
                'status',
                'Active'
            )
            ->with('organization')
            ->first();


        if (!$moderator) {

            return response()->json([

                'message' =>
                    'Unauthorized moderator access.'

            ], 403);

        }


        $totalStudents =
            User::where(
                'organization_id',
                $moderator->organization_id
            )
            ->where(
                'role',
                'student'
            )
            ->count();


        $totalMeetings =
            Meeting::where(
                'organization_id',
                $moderator->organization_id
            )
            ->count();


        $attendanceRecords =
            Attendance::whereHas(
                'meeting',
                function ($query) use ($moderator) {

                    $query->where(
                        'organization_id',
                        $moderator->organization_id
                    );

                }
            )
            ->get();


        $present =
            $attendanceRecords
                ->where(
                    'status',
                    'present'
                )
                ->count();


        $late =
            $attendanceRecords
                ->where(
                    'status',
                    'late'
                )
                ->count();


        $absent =
            $attendanceRecords
                ->where(
                    'status',
                    'absent'
                )
                ->count();


        $excused =
            $attendanceRecords
                ->where(
                    'status',
                    'excused'
                )
                ->count();


        $recordedAttendance =
            $present +
            $late +
            $absent +
            $excused;


        $attendanceRate = 0;


        if (
            $recordedAttendance > 0
        ) {

            $attendanceRate =
                round(
                    (
                        (
                            $present +
                            $late
                        )
                        /
                        $recordedAttendance
                    ) * 100
                );

        }


        return response()->json([

            'moderator' => [

                'id' =>
                    $moderator->student_id,

                'name' =>
                    $moderator->name,

                'organization_id' =>
                    $moderator->organization_id,

                'organization' =>
                    $moderator->organization,

            ],

            'students' => [

                'total' =>
                    $totalStudents,

            ],

            'attendance' => [

                'present' =>
                    $present,

                'late' =>
                    $late,

                'absent' =>
                    $absent,

                'excused' =>
                    $excused,

                'total_records' =>
                    $recordedAttendance,

                'rate' =>
                    $attendanceRate,

            ],

            'meetings' => [

                'total' =>
                    $totalMeetings,

            ],

        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | OFFICER DASHBOARD
    |--------------------------------------------------------------------------
    */

    public function officerDashboard(
        Request $request
    ) {

        $officer =
            User::where(
                'student_id',
                $request->officer_id
            )
            ->where(
                'role',
                'officer'
            )
            ->where(
                'status',
                'Active'
            )
            ->with('organization')
            ->first();


        if (!$officer) {

            return response()->json([

                'message' =>
                    'Unauthorized officer access.'

            ], 403);

        }


        $meetings =
            Meeting::where(
                'organization_id',
                $officer->organization_id
            )
            ->with('organization')
            ->orderBy(
                'date',
                'asc'
            )
            ->orderBy(
                'start_time',
                'asc'
            )
            ->get();


        $totalMembers =
            User::where(
                'organization_id',
                $officer->organization_id
            )
            ->where(
                'role',
                'student'
            )
            ->count();


        $attendanceRecords =
            Attendance::whereHas(
                'meeting',
                function ($query) use ($officer) {

                    $query->where(
                        'organization_id',
                        $officer->organization_id
                    );

                }
            )
            ->get();


        $present =
            $attendanceRecords
                ->whereIn(
                    'status',
                    [
                        'present',
                        'late'
                    ]
                )
                ->count();


        $totalMeetings =
            $meetings->count();


        $expectedAttendance =
            $totalMembers *
            $totalMeetings;


        $attendanceRate =
            0;


        if (
            $expectedAttendance > 0
        ) {

            $attendanceRate =
                round(
                    (
                        $present /
                        $expectedAttendance
                    ) * 100
                );

        }


        $now =
            now();


        $upcomingMeeting =
            $meetings
                ->filter(
                    function ($meeting) use ($now) {

                        if (!$meeting->date) {

                            return false;

                        }


                        $date =
                            $meeting->date
                                ->format('Y-m-d');


                        $time =
                            $meeting->start_time
                            ?: '00:00:00';


                        $meetingDateTime =
                            \Carbon\Carbon::parse(
                                $date . ' ' . $time
                            );


                        if (
                            strtolower(
                                $meeting->status ?? ''
                            ) ===
                            'cancelled'
                        ) {

                            return false;

                        }


                        return $meetingDateTime
                            ->greaterThanOrEqualTo(
                                $now
                            );

                    }
                )
                ->sortBy(
                    function ($meeting) {

                        $date =
                            $meeting->date
                                ? $meeting->date
                                    ->format('Y-m-d')
                                : '9999-12-31';


                        $time =
                            $meeting->start_time
                            ?: '00:00:00';


                        return $date .
                            ' ' .
                            $time;

                    }
                )
                ->first();


        return response()->json([

            'officer' => [

                'id' =>
                    $officer->student_id,

                'name' =>
                    $officer->name,

                'club_role' =>
                    $officer->club_role,

                'organization_id' =>
                    $officer->organization_id,

                'organization' =>
                    $officer->organization,

            ],

            'statistics' => [

                'total_meetings' =>
                    $totalMeetings,

                'total_members' =>
                    $totalMembers,

                'attendance_rate' =>
                    $attendanceRate,

            ],

            'upcoming_meeting' =>
                $upcomingMeeting,

            'meetings' =>
                $meetings,

        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | FIND STUDENT BY UNIQUE ID
    |--------------------------------------------------------------------------
    */

    public function findStudent(
        $uniqueId
    ) {

        $student =
            User::where(
                'unique_id',
                $uniqueId
            )
            ->where(
                'role',
                'student'
            )
            ->where(
                'status',
                'Active'
            )
            ->with('organization')
            ->first();


        if (!$student) {

            return response()->json([

                'message' =>
                    'Student not found.'

            ], 404);

        }


        return response()->json([

            'student' =>
                $student

        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | OFFICER MEMBERS
    |--------------------------------------------------------------------------
    */

    public function officerMembers(
        Request $request
    ) {

        $validated = $request->validate([

            'officer_id' => [
                'required',
                'string'
            ],

        ]);


        $officer =
            User::where(
                'student_id',
                $validated['officer_id']
            )
            ->where(
                'role',
                'officer'
            )
            ->where(
                'status',
                'Active'
            )
            ->with('organization')
            ->first();


        if (!$officer) {

            return response()->json([

                'message' =>
                    'Unauthorized officer access.'

            ], 403);

        }


        $members =
            User::where(
                'organization_id',
                $officer->organization_id
            )
            ->where(
                'role',
                'student'
            )
            ->orderBy(
                'name',
                'asc'
            )
            ->get();


        $meetingIds =
            Meeting::where(
                'organization_id',
                $officer->organization_id
            )
            ->pluck('id');


        $totalMeetings =
            $meetingIds->count();


        $memberData =
            $members->map(
                function ($member) use (
                    $meetingIds,
                    $totalMeetings
                ) {

                    $attendanceCount =
                        Attendance::where(
                            'user_id',
                            $member->id
                        )
                        ->whereIn(
                            'meeting_id',
                            $meetingIds
                        )
                        ->whereIn(
                            'status',
                            [
                                'present',
                                'late'
                            ]
                        )
                        ->count();


                    $attendanceRate =
                        0;


                    if (
                        $totalMeetings > 0
                    ) {

                        $attendanceRate =
                            round(
                                (
                                    $attendanceCount /
                                    $totalMeetings
                                ) * 100
                            );

                    }


                    return [

                        'id' =>
                            $member->id,

                        'name' =>
                            $member->name,

                        'student_id' =>
                            $member->student_id,

                        'section' =>
                            $member->section,

                        'club_role' =>
                            $member->club_role
                            ?: 'Member',

                        'role' =>
                            $member->role,

                        'status' =>
                            $member->status
                            ?: 'Active',

                        'attendance' =>
                            $attendanceRate,

                    ];

                }
            )
            ->values();


        $totalMembers =
            $members->count();


        $activeMembers =
            $members
                ->where(
                    'status',
                    'Active'
                )
                ->count();


        $totalOfficers =
            User::where(
                'organization_id',
                $officer->organization_id
            )
            ->where(
                'role',
                'officer'
            )
            ->count();


        return response()->json([

            'officer' => [

                'id' =>
                    $officer->student_id,

                'name' =>
                    $officer->name,

                'organization_id' =>
                    $officer->organization_id,

            ],

            'statistics' => [

                'total_members' =>
                    $totalMembers,

                'active_members' =>
                    $activeMembers,

                'total_officers' =>
                    $totalOfficers,

            ],

            'members' =>
                $memberData,

        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE OFFICER PROFILE
    |--------------------------------------------------------------------------
    */

    public function updateOfficerProfile(
        Request $request
    ) {

        $validated = $request->validate([

            'officer_id' => [
                'required',
                'string'
            ],

            'name' => [
                'required',
                'string',
                'max:255'
            ],

        ]);


        $officer =
            User::where(
                'student_id',
                $validated['officer_id']
            )
            ->where(
                'role',
                'officer'
            )
            ->where(
                'status',
                'Active'
            )
            ->with('organization')
            ->first();


        if (!$officer) {

            return response()->json([

                'message' =>
                    'Unauthorized officer access.'

            ], 403);

        }


        $officer->name =
            $validated['name'];


        $officer->save();


        return response()->json([

            'message' =>
                'Profile updated successfully.',

            'officer' => [

                'id' =>
                    $officer->student_id,

                'name' =>
                    $officer->name,

                'club_role' =>
                    $officer->club_role,

                'organization_id' =>
                    $officer->organization_id,

                'organization' =>
                    $officer->organization,

            ],

        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE OFFICER PASSWORD
    |--------------------------------------------------------------------------
    */

    public function updateOfficerPassword(
        Request $request
    ) {

        $validated = $request->validate([

            'officer_id' => [
                'required',
                'string'
            ],

            'current_password' => [
                'required',
                'string'
            ],

            'new_password' => [
                'required',
                'string',
                'min:6'
            ],

        ]);


        $officer =
            User::where(
                'student_id',
                $validated['officer_id']
            )
            ->where(
                'role',
                'officer'
            )
            ->where(
                'status',
                'Active'
            )
            ->first();


        if (!$officer) {

            return response()->json([

                'message' =>
                    'Officer account not found.'

            ], 404);

        }


        if (
            !Hash::check(
                $validated['current_password'],
                $officer->password
            )
        ) {

            return response()->json([

                'message' =>
                    'Current password is incorrect.'

            ], 422);

        }


        $officer->password =
            Hash::make(
                $validated['new_password']
            );


        $officer->save();


        return response()->json([

            'message' =>
                'Password changed successfully.'

        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | MODERATOR STUDENT RECORDS
    |--------------------------------------------------------------------------
    */

    public function moderatorStudents(
        Request $request
    ) {

        $validated = $request->validate([

            'moderator_id' => [
                'required',
                'string'
            ],

        ]);


        $moderator =
            User::where(
                'student_id',
                $validated['moderator_id']
            )
            ->where(
                'role',
                'moderator'
            )
            ->where(
                'status',
                'Active'
            )
            ->with('organization')
            ->first();


        if (!$moderator) {

            return response()->json([

                'message' =>
                    'Unauthorized moderator access.'

            ], 403);

        }


        $students =
            User::where(
                'organization_id',
                $moderator->organization_id
            )
            ->where(
                'role',
                'student'
            )
            ->with('organization')
            ->orderBy(
                'name',
                'asc'
            )
            ->get();


        return response()->json([

            'moderator' => [

                'id' =>
                    $moderator->student_id,

                'name' =>
                    $moderator->name,

                'organization_id' =>
                    $moderator->organization_id,

                'organization' =>
                    $moderator->organization,

            ],

            'students' =>
                $students,

        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | MODERATOR RESET STUDENT PASSWORD
    |--------------------------------------------------------------------------
    */

    public function moderatorResetStudentPassword(
        Request $request
    ) {

        $validated = $request->validate([

            'moderator_id' => [
                'required',
                'string'
            ],

            'student_id' => [
                'required',
                'string'
            ],

        ]);


        /*
        |--------------------------------------------------------------------------
        | FIND MODERATOR
        |--------------------------------------------------------------------------
        */

        $moderator =
            User::where(
                'student_id',
                $validated['moderator_id']
            )
            ->where(
                'role',
                'moderator'
            )
            ->where(
                'status',
                'Active'
            )
            ->first();


        if (!$moderator) {

            return response()->json([

                'message' =>
                    'Unauthorized moderator access.'

            ], 403);

        }


        /*
        |--------------------------------------------------------------------------
        | FIND STUDENT
        |--------------------------------------------------------------------------
        */

        $student =
            User::where(
                'student_id',
                $validated['student_id']
            )
            ->where(
                'role',
                'student'
            )
            ->first();


        if (!$student) {

            return response()->json([

                'message' =>
                    'Student not found.'

            ], 404);

        }


        /*
        |--------------------------------------------------------------------------
        | ORGANIZATION SECURITY CHECK
        |--------------------------------------------------------------------------
        */

        if (
            (int) $student->organization_id !==
            (int) $moderator->organization_id
        ) {

            return response()->json([

                'message' =>
                    'You can only reset passwords for students in your organization.'

            ], 403);

        }


        /*
        |--------------------------------------------------------------------------
        | GENERATE TEMPORARY PASSWORD
        |--------------------------------------------------------------------------
        */

        $temporaryPassword =
            'DNX-' .
            strtoupper(
                \Illuminate\Support\Str::random(8)
            );


        /*
        |--------------------------------------------------------------------------
        | SAVE TEMPORARY PASSWORD
        |--------------------------------------------------------------------------
        */

        $student->password =
            Hash::make(
                $temporaryPassword
            );


        $student->password_reset_required =
            true;


        $student->save();


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'message' =>
                'Student password has been reset successfully.',

            'student' => [

                'student_id' =>
                    $student->student_id,

                'name' =>
                    $student->name,

            ],

            'temporary_password' =>
                $temporaryPassword,

        ]);
    }

    /*
|--------------------------------------------------------------------------
| MODERATOR ATTENDANCE HISTORY
|--------------------------------------------------------------------------
*/

public function moderatorAttendanceHistory(
    Request $request
) {

    /*
    |--------------------------------------------------------------------------
    | VALIDATE MODERATOR
    |--------------------------------------------------------------------------
    */

    $validated =
        $request->validate([

            'moderator_id' => [
                'required',
                'string'
            ],

            'meeting_id' => [
                'nullable',
                'integer'
            ],

        ]);


    /*
    |--------------------------------------------------------------------------
    | FIND ACTIVE MODERATOR
    |--------------------------------------------------------------------------
    */

    $moderator =
        User::where(
            'student_id',
            $validated['moderator_id']
        )
        ->where(
            'role',
            'moderator'
        )
        ->where(
            'status',
            'Active'
        )
        ->with('organization')
        ->first();


    if (!$moderator) {

        return response()->json([

            'message' =>
                'Unauthorized moderator access.'

        ], 403);

    }

    /*
    |--------------------------------------------------------------------------
    | AUTOMATICALLY RECORD ABSENT STUDENTS
    |--------------------------------------------------------------------------
    */

            $this->recordAbsentStudents(
                $moderator
            );
            
    /*
    |--------------------------------------------------------------------------
    | GET MEETINGS
    | ONLY FROM MODERATOR'S ORGANIZATION
    |--------------------------------------------------------------------------
    */

    $meetings =
        Meeting::where(
            'organization_id',
            $moderator->organization_id
        )
        ->orderBy(
            'date',
            'desc'
        )
        ->orderBy(
            'start_time',
            'desc'
        )
        ->get();


    /*
    |--------------------------------------------------------------------------
    | OPTIONAL MEETING FILTER
    |--------------------------------------------------------------------------
    */

    $attendanceQuery =
        Attendance::whereHas(
            'meeting',
            function ($query) use ($moderator) {

                $query->where(
                    'organization_id',
                    $moderator->organization_id
                );

            }
        );


    if (
        !empty(
            $validated['meeting_id']
        )
    ) {

        /*
         * Make sure the selected meeting
         * belongs to the moderator's organization.
         */

        $meetingExists =
            Meeting::where(
                'id',
                $validated['meeting_id']
            )
            ->where(
                'organization_id',
                $moderator->organization_id
            )
            ->exists();


        if (!$meetingExists) {

            return response()->json([

                'message' =>
                    'Meeting not found or unauthorized.'

            ], 403);

        }


        $attendanceQuery->where(
            'meeting_id',
            $validated['meeting_id']
        );

    }


    /*
    |--------------------------------------------------------------------------
    | GET ATTENDANCE RECORDS
    |--------------------------------------------------------------------------
    */

    $attendanceRecords =
        $attendanceQuery
            ->orderBy(
                'created_at',
                'desc'
            )
            ->get();


    /*
    |--------------------------------------------------------------------------
    | GET STUDENTS
    | ONLY FROM MODERATOR'S ORGANIZATION
    |--------------------------------------------------------------------------
    */

    $studentIds =
        $attendanceRecords
            ->pluck(
                'user_id'
            )
            ->filter()
            ->unique()
            ->values();


    $students =
        User::whereIn(
            'id',
            $studentIds
        )
        ->where(
            'organization_id',
            $moderator->organization_id
        )
        ->where(
            'role',
            'student'
        )
        ->get()
        ->keyBy(
            'id'
        );


    /*
    |--------------------------------------------------------------------------
    | BUILD HISTORY
    |--------------------------------------------------------------------------
    */

    $history =
        $attendanceRecords
            ->map(
                function ($attendance) use (
                    $students
                ) {

                    $student =
                        $students->get(
                            $attendance->user_id
                        );


                    $meeting =
                        $attendance->meeting;


                    if (
                        !$student ||
                        !$meeting
                    ) {

                        return null;

                    }


                    return [

                        'id' =>
                            $attendance->id,

                       'student' => [

    'id' =>
        $student->id,

    'name' =>
        $student->name,

    'student_id' =>
        $student->student_id,

    'unique_id' =>
        $student->unique_id,

    'section' =>
        $student->section,

    /*
    |--------------------------------------------------------------------------
    | DIGITAL SIGNATURE
    |--------------------------------------------------------------------------
    |
    | Automatically use the signature saved during registration.
    | Only PRESENT and LATE students receive the signature.
    | ABSENT and EXCUSED students receive null.
    |
    */

    'digital_signature' =>
        in_array(
            strtolower(
                $attendance->status
            ),
            [
                'present',
                'late'
            ]
        )
            ? $student->digital_signature
            : null,

],

                        'meeting' => [

                            'id' =>
                                $meeting->id,

                            'title' =>
                                $meeting->title,

                            'date' =>
                                $meeting->date,

                            'start_time' =>
                                $meeting->start_time,

                        ],

                        'status' =>
                            $attendance->status,

                        'scanned_at' =>
                            $attendance->scanned_at,

                        'created_at' =>
                            $attendance->created_at,

                    ];

                }
            )
            ->filter()
            ->values();


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return response()->json([

        'moderator' => [

            'id' =>
                $moderator->student_id,

            'name' =>
                $moderator->name,

            'organization_id' =>
                $moderator->organization_id,

            'organization' =>
                $moderator->organization,

        ],

        'meetings' =>
            $meetings,

        'history' =>
            $history,

    ]);

}

/*
|--------------------------------------------------------------------------
| RECORD ABSENT STUDENTS
|--------------------------------------------------------------------------
*/

private function recordAbsentStudents(
    $moderator
) {

    /*
    |--------------------------------------------------------------------------
    | GET ACTIVE STUDENTS
    |--------------------------------------------------------------------------
    */

    $students =
        User::where(
            'organization_id',
            $moderator->organization_id
        )
        ->where(
            'role',
            'student'
        )
        ->where(
            'status',
            'Active'
        )
        ->get();


    if (
        $students->isEmpty()
    ) {

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | GET COMPLETED MEETINGS
    |--------------------------------------------------------------------------
    */

    $meetings =
        Meeting::where(
            'organization_id',
            $moderator->organization_id
        )
        ->where(
            function ($query) {

                $query
                    ->where(
                        'date',
                        '<',
                        now()->toDateString()
                    )
                    ->orWhere(
                        function ($query) {

                            $query
                                ->where(
                                    'date',
                                    now()->toDateString()
                                )
                                ->where(
                                    'start_time',
                                    '<=',
                                    now()->format('H:i:s')
                                );

                        }
                    );

            }
        )
        ->where(
            function ($query) {

                $query
                    ->whereNull(
                        'status'
                    )
                    ->orWhereRaw(
                        'LOWER(status) != ?',
                        [
                            'cancelled'
                        ]
                    );

            }
        )
        ->get();


    /*
    |--------------------------------------------------------------------------
    | CHECK EACH STUDENT / MEETING
    |--------------------------------------------------------------------------
    */

    foreach (
        $meetings as $meeting
    ) {

        foreach (
            $students as $student
        ) {

            /*
             * Check if the student already
             * has an attendance record.
             */

            $alreadyRecorded =
                Attendance::where(
                    'meeting_id',
                    $meeting->id
                )
                ->where(
                    'user_id',
                    $student->id
                )
                ->exists();


            /*
             * Do not create another record
             * if attendance already exists.
             */

            if (
                $alreadyRecorded
            ) {

                continue;

            }


            /*
             * Student did not attend
             * and did not have an excuse.
             *
             * Therefore record ABSENT.
             */

            Attendance::create([

                'meeting_id' =>
                    $meeting->id,

                'user_id' =>
                    $student->id,

                'status' =>
                    'absent',

            ]);

        }

    } 

}

/*
|--------------------------------------------------------------------------
| MODERATOR REPORTS
|--------------------------------------------------------------------------
*/

public function moderatorReports(
    Request $request
) {

    $validated =
        $request->validate([

            'moderator_id' => [
                'required',
                'string'
            ],

        ]);


    /*
    |--------------------------------------------------------------------------
    | FIND MODERATOR
    |--------------------------------------------------------------------------
    */

    $moderator =
        User::where(
            'student_id',
            $validated['moderator_id']
        )
        ->where(
            'role',
            'moderator'
        )
        ->where(
            'status',
            'Active'
        )
        ->first();


    if (!$moderator) {

        return response()->json([

            'message' =>
                'Unauthorized moderator access.'

        ], 403);

    }


    /*
    |--------------------------------------------------------------------------
    | GET STUDENTS
    |--------------------------------------------------------------------------
    */

    $students =
        User::where(
            'organization_id',
            $moderator->organization_id
        )
        ->where(
            'role',
            'student'
        )
        ->where(
            'status',
            'Active'
        )
        ->orderBy(
            'name',
            'asc'
        )
        ->get();


    /*
    |--------------------------------------------------------------------------
    | GET MEETINGS
    |--------------------------------------------------------------------------
    */

    $meetings =
        Meeting::where(
            'organization_id',
            $moderator->organization_id
        )
        ->orderBy(
            'date',
            'desc'
        )
        ->orderBy(
            'start_time',
            'desc'
        )
        ->get();


    /*
    |--------------------------------------------------------------------------
    | GET ATTENDANCE
    |--------------------------------------------------------------------------
    */

    $attendance =
        Attendance::whereHas(
            'meeting',
            function ($query) use ($moderator) {

                $query->where(
                    'organization_id',
                    $moderator->organization_id
                );

            }
        )
        ->with([
            'meeting',
            'student'
        ])
        ->get();


    /*
    |--------------------------------------------------------------------------
    | FORMAT ATTENDANCE
    |--------------------------------------------------------------------------
    */

    $attendanceData =
        $attendance->map(
            function ($record) {

                return [

                    'id' =>
                        $record->id,

                    'meeting_id' =>
                        $record->meeting_id,

                    'meeting' =>
                        $record->meeting
                        ? [
                            'id' =>
                                $record->meeting->id,

                            'title' =>
                                $record->meeting->title,

                            'date' =>
                                $record->meeting->date,

                            'start_time' =>
                                $record->meeting->start_time,

                        ]
                        : null,

                    'student' =>
                        $record->student
                        ? [
                            'id' =>
                                $record->student->id,

                            'name' =>
                                $record->student->name,

                            'student_id' =>
                                $record->student->student_id,

                            'unique_id' =>
                                $record->student->unique_id,

                            'section' =>
                                $record->student->section,

                            'club_role' =>
                                $record->student->club_role,

                        ]
                        : null,

                    'status' =>
                        $record->status,

                    'scanned_at' =>
                        $record->scanned_at,

                    'remarks' =>
                        null,

                ];

            }
        )
        ->values();


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return response()->json([

        'moderator' => [

            'id' =>
                $moderator->student_id,

            'name' =>
                $moderator->name,

            'organization_id' =>
                $moderator->organization_id,

        ],

        'students' =>
            $students,

        'meetings' =>
            $meetings,

        'attendance' =>
            $attendanceData,

    ]);

}

/*
|--------------------------------------------------------------------------
| MODERATOR NOTIFICATIONS
|--------------------------------------------------------------------------
*/

public function moderatorNotifications(
    Request $request
) {

    $validated = $request->validate([

        'moderator_id' => [
            'required',
            'string'
        ],

    ]);


    /*
    |--------------------------------------------------------------------------
    | FIND MODERATOR
    |--------------------------------------------------------------------------
    */

    $moderator =
        User::where(
            'student_id',
            $validated['moderator_id']
        )
        ->where(
            'role',
            'moderator'
        )
        ->where(
            'status',
            'Active'
        )
        ->first();


    if (!$moderator) {

        return response()->json([

            'message' =>
                'Unauthorized moderator access.'

        ], 403);

    }


    /*
    |--------------------------------------------------------------------------
    | PENDING OFFICER APPLICATIONS
    |--------------------------------------------------------------------------
    */

    $pendingOfficers =
        User::where(
            'organization_id',
            $moderator->organization_id
        )
        ->where(
            'role',
            'officer'
        )
        ->where(
            'status',
            'Pending'
        )
        ->orderBy(
            'created_at',
            'desc'
        )
        ->get();


    /*
    |--------------------------------------------------------------------------
    | MEETINGS
    |--------------------------------------------------------------------------
    */

    $meetings =
        Meeting::where(
            'organization_id',
            $moderator->organization_id
        )
        ->orderBy(
            'date',
            'desc'
        )
        ->orderBy(
            'start_time',
            'desc'
        )
        ->get();


    /*
    |--------------------------------------------------------------------------
    | ACTIVE STUDENTS
    |--------------------------------------------------------------------------
    */

    $students =
        User::where(
            'organization_id',
            $moderator->organization_id
        )
        ->where(
            'role',
            'student'
        )
        ->where(
            'status',
            'Active'
        )
        ->get();


    /*
    |--------------------------------------------------------------------------
    | LOW ATTENDANCE
    |--------------------------------------------------------------------------
    */

    $lowAttendance = [];


    foreach (
        $students as $student
    ) {

        $totalMeetings =
            $meetings->count();


        if (
            $totalMeetings === 0
        ) {

            continue;

        }


        $attendanceCount =
            Attendance::where(
                'user_id',
                $student->id
            )
            ->whereIn(
                'meeting_id',
                $meetings->pluck('id')
            )
            ->whereIn(
                'status',
                [
                    'present',
                    'late'
                ]
            )
            ->count();


        $percentage =
            round(
                (
                    $attendanceCount /
                    $totalMeetings
                ) * 100
            );


        if (
            $percentage < 50
        ) {

            $lowAttendance[] = [

                'student' => [

                    'id' =>
                        $student->id,

                    'name' =>
                        $student->name,

                    'student_id' =>
                        $student->student_id,

                    'unique_id' =>
                        $student->unique_id,

                ],

                'attendance' =>
                    $attendanceCount,

                'total_meetings' =>
                    $totalMeetings,

                'percentage' =>
                    $percentage,

            ];

        }

    }


    /*
    |--------------------------------------------------------------------------
    | MEETING UPDATES
    |--------------------------------------------------------------------------
    |
    | Return recent meetings so the frontend can identify
    | recently created, updated, completed, or cancelled meetings.
    |
    */

    $recentMeetings =
        Meeting::where(
            'organization_id',
            $moderator->organization_id
        )
        ->latest(
            'updated_at'
        )
        ->limit(20)
        ->get();


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return response()->json([

        'moderator' => [

            'id' =>
                $moderator->student_id,

            'name' =>
                $moderator->name,

            'organization_id' =>
                $moderator->organization_id,

        ],

        'pending_officers' =>
            $pendingOfficers,

        'low_attendance' =>
            $lowAttendance,

        'recent_meetings' =>
            $recentMeetings,

    ]);

}

}