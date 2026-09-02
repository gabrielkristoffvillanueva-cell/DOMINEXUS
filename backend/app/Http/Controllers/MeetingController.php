<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\User;
use App\Models\Attendance;
use Illuminate\Http\Request;

class MeetingController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET MEETINGS
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | MODERATOR
        |--------------------------------------------------------------------------
        */

        if ($request->filled('moderator_id')) {

            $moderator = User::where(
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


            $meetings =
                Meeting::where(
                    'organization_id',
                    $moderator->organization_id
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


            return response()->json(
                $meetings
            );
        }


        /*
        |--------------------------------------------------------------------------
        | OFFICER
        |--------------------------------------------------------------------------
        */

        if ($request->filled('officer_id')) {

            $officer = User::where(
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


            return response()->json(
                $meetings
            );
        }


        /*
        |--------------------------------------------------------------------------
        | NO USER IDENTIFIER
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'message' =>
                'Unauthorized access.'

        ], 403);
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE MEETING
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request
    ) {

        $validated =
            $request->validate([

                'title' => [
                    'required',
                    'string',
                    'max:255'
                ],

                'date' => [
                    'required',
                    'date'
                ],

                'start_time' => [
                    'required',
                    'date_format:H:i'
                ],

                'end_time' => [
                    'nullable',
                    'date_format:H:i',
                    'after:start_time'
                ],

                'location' => [
                    'nullable',
                    'string',
                    'max:255'
                ],

                'status' => [
                    'nullable',
                    'in:upcoming,ongoing,completed,cancelled'
                ],

                'officer_id' => [
                    'nullable',
                    'string'
                ],

                'moderator_id' => [
                    'nullable',
                    'string'
                ],

            ]);


        /*
        |--------------------------------------------------------------------------
        | FIND USER
        |--------------------------------------------------------------------------
        */

        $user = null;


        if (
            !empty(
                $validated['moderator_id']
            )
        ) {

            $user =
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

        }


        if (
            !$user &&
            !empty(
                $validated['officer_id']
            )
        ) {

            $user =
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

        }


        if (!$user) {

            return response()->json([

                'message' =>
                    'Unauthorized access.'

            ], 403);

        }


        /*
        |--------------------------------------------------------------------------
        | DETERMINE STATUS
        |--------------------------------------------------------------------------
        */

        $status =
            $validated['status']
            ??
            $this->determineStatus(
                $validated['date'],
                $validated['start_time'],
                $validated['end_time']
                ?? null
            );


        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        $meeting =
            Meeting::create([

                'organization_id' =>
                    $user->organization_id,

                'title' =>
                    $validated['title'],

                'date' =>
                    $validated['date'],

                'start_time' =>
                    $validated['start_time'],

                'end_time' =>
                    $validated['end_time']
                    ?? null,

                'location' =>
                    $validated['location']
                    ?? null,

                'status' =>
                    $status,

            ]);


        return response()->json([

            'message' =>
                'Meeting created successfully.',

            'meeting' =>
                $meeting->load(
                    'organization'
                ),

        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | SHOW MEETING
    |--------------------------------------------------------------------------
    */

    public function show(
        Meeting $meeting
    ) {

        return response()->json(

            $meeting->load(
                'organization'
            )

        );
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE MEETING
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        $id
    ) {

        $validated =
            $request->validate([

                'title' => [
                    'required',
                    'string',
                    'max:255'
                ],

                'date' => [
                    'required',
                    'date'
                ],

                'start_time' => [
                    'required',
                    'date_format:H:i'
                ],

                'end_time' => [
                    'nullable',
                    'date_format:H:i',
                    'after:start_time'
                ],

                'location' => [
                    'nullable',
                    'string',
                    'max:255'
                ],

                'status' => [
                    'nullable',
                    'in:upcoming,ongoing,completed,cancelled'
                ],

                'officer_id' => [
                    'nullable',
                    'string'
                ],

                'moderator_id' => [
                    'nullable',
                    'string'
                ],

            ]);


        /*
        |--------------------------------------------------------------------------
        | FIND USER
        |--------------------------------------------------------------------------
        */

        $user = null;


        if (
            !empty(
                $validated['moderator_id']
            )
        ) {

            $user =
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

        }


        if (
            !$user &&
            !empty(
                $validated['officer_id']
            )
        ) {

            $user =
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

        }


        if (!$user) {

            return response()->json([

                'message' =>
                    'Unauthorized access.'

            ], 403);

        }


        /*
        |--------------------------------------------------------------------------
        | FIND MEETING
        |--------------------------------------------------------------------------
        */

        $meeting =
            Meeting::where(
                'id',
                $id
            )
            ->where(
                'organization_id',
                $user->organization_id
            )
            ->first();


        if (!$meeting) {

            return response()->json([

                'message' =>
                    'Meeting not found or does not belong to your organization.'

            ], 404);

        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        $meeting->title =
            $validated['title'];

        $meeting->date =
            $validated['date'];

        $meeting->start_time =
            $validated['start_time'];

        $meeting->end_time =
            $validated['end_time']
            ?? null;

        $meeting->location =
            $validated['location']
            ?? null;


        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        if (
            isset(
                $validated['status']
            )
        ) {

            $meeting->status =
                $validated['status'];

        } else {

            $meeting->status =
                $this->determineStatus(
                    $validated['date'],
                    $validated['start_time'],
                    $validated['end_time']
                    ?? null
                );

        }


        /*
        |--------------------------------------------------------------------------
        | SAVE MEETING
        |--------------------------------------------------------------------------
        */

        $meeting->save();


        /*
        |--------------------------------------------------------------------------
        | AUTOMATICALLY RECORD ABSENT STUDENTS
        |--------------------------------------------------------------------------
        |
        | This runs only when the meeting becomes completed.
        |
        */

        $absentCount = 0;


if (
    strtolower(
        $meeting->status ?? ''
    ) === 'completed'
) {

    $absentCount =
        $this->recordAbsentStudents(
            $meeting
        );

}


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'message' =>
                'Meeting updated successfully.',

            'meeting' =>
                $meeting->load(
                    'organization'
                ),

        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE MEETING
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        $id
    ) {

        $validated =
            $request->validate([

                'officer_id' => [
                    'nullable',
                    'string'
                ],

                'moderator_id' => [
                    'nullable',
                    'string'
                ],

            ]);


        /*
        |--------------------------------------------------------------------------
        | FIND USER
        |--------------------------------------------------------------------------
        */

        $user = null;


        if (
            !empty(
                $validated['moderator_id']
            )
        ) {

            $user =
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

        }


        if (
            !$user &&
            !empty(
                $validated['officer_id']
            )
        ) {

            $user =
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

        }


        if (!$user) {

            return response()->json([

                'message' =>
                    'Unauthorized access.'

            ], 403);

        }


        /*
        |--------------------------------------------------------------------------
        | FIND MEETING
        |--------------------------------------------------------------------------
        */

        $meeting =
            Meeting::where(
                'id',
                $id
            )
            ->where(
                'organization_id',
                $user->organization_id
            )
            ->first();


        if (!$meeting) {

            return response()->json([

                'message' =>
                    'Meeting not found or does not belong to your organization.'

            ], 404);

        }


        /*
        |--------------------------------------------------------------------------
        | DELETE
        |--------------------------------------------------------------------------
        */

        $meeting->delete();


        return response()->json([

            'message' =>
                'Meeting deleted successfully.'

        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DETERMINE STATUS
    |--------------------------------------------------------------------------
    */

    private function determineStatus(
        $date,
        $startTime,
        $endTime = null
    ) {

        $start =
            \Carbon\Carbon::parse(
                $date .
                ' ' .
                $startTime
            );


        $end =
            $endTime
                ? \Carbon\Carbon::parse(
                    $date .
                    ' ' .
                    $endTime
                )
                : $start
                    ->copy()
                    ->addHours(2);


        $now =
            \Carbon\Carbon::now();


        if (
            $now->lt(
                $start
            )
        ) {

            return 'upcoming';

        }


        if (
            $now->between(
                $start,
                $end
            )
        ) {

            return 'ongoing';

        }


        return 'completed';
    }


    /*
|--------------------------------------------------------------------------
| RECORD ABSENT STUDENTS WHEN MEETING IS COMPLETED
|--------------------------------------------------------------------------
*/

private function recordAbsentStudents(
    Meeting $meeting
) {

    /*
    |--------------------------------------------------------------------------
    | GET ALL ACTIVE STUDENTS IN THE ORGANIZATION
    |--------------------------------------------------------------------------
    */

    $students =
        User::where(
            'organization_id',
            $meeting->organization_id
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


    $absentCount = 0;


    /*
    |--------------------------------------------------------------------------
    | CHECK EVERY STUDENT
    |--------------------------------------------------------------------------
    */

    foreach (
        $students as $student
    ) {

        /*
        |--------------------------------------------------------------------------
        | CHECK IF STUDENT ALREADY HAS AN ATTENDANCE RECORD
        |--------------------------------------------------------------------------
        */

        $attendance =
            Attendance::where(
                'meeting_id',
                $meeting->id
            )
            ->where(
                'user_id',
                $student->id
            )
            ->first();


        /*
        |--------------------------------------------------------------------------
        | ALREADY RECORDED
        |--------------------------------------------------------------------------
        |
        | Present
        | Late
        | Excused
        | Absent
        |
        | Leave it unchanged.
        |
        */

        if ($attendance) {

            continue;

        }


        /*
        |--------------------------------------------------------------------------
        | CREATE ABSENT RECORD
        |--------------------------------------------------------------------------
        */

        $attendance =
            new Attendance();


        $attendance->meeting_id =
            $meeting->id;


        $attendance->user_id =
            $student->id;


        $attendance->status =
            'absent';


        $attendance->scanned_at =
            null;


        $attendance->save();


        $absentCount++;

    }


    return $absentCount;
}
}