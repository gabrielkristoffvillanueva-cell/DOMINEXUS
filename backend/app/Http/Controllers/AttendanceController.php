<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Meeting;
use App\Models\User;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * Get attendance records.
     *
     * If officer_id is provided, only attendance
     * belonging to the officer's organization
     * will be returned.
     */
    public function index(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | VERIFY OFFICER WHEN officer_id IS PROVIDED
        |--------------------------------------------------------------------------
        */

        $officer = null;

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
        }


        /*
        |--------------------------------------------------------------------------
        | ATTENDANCE QUERY
        |--------------------------------------------------------------------------
        */

        $query = Attendance::with([
            'meeting.organization',
            'student.organization'
        ]);


        /*
        |--------------------------------------------------------------------------
        | ORGANIZATION RESTRICTION
        |--------------------------------------------------------------------------
        */

        if ($officer) {

            $query->whereHas(
                'meeting',
                function ($q) use ($officer) {

                    $q->where(
                        'organization_id',
                        $officer->organization_id
                    );

                }
            );

        }


        /*
        |--------------------------------------------------------------------------
        | MEETING FILTER
        |--------------------------------------------------------------------------
        */

        if ($request->filled('meeting_id')) {

            $query->where(
                'meeting_id',
                $request->meeting_id
            );

        }


        /*
        |--------------------------------------------------------------------------
        | STUDENT FILTER
        |--------------------------------------------------------------------------
        */

        if ($request->filled('student_id')) {

            $query->whereHas(
                'student',
                function ($q) use ($request) {

                    $q->where(
                        'student_id',
                        $request->student_id
                    );

                }
            );

        }


        /*
        |--------------------------------------------------------------------------
        | GET ATTENDANCE
        |--------------------------------------------------------------------------
        */

        $attendance =
            $query
                ->latest('scanned_at')
                ->get();


        return response()->json(
            $attendance
        );
    }


    /**
     * Record attendance from QR scanner.
     */
    public function store(
        Request $request
    ) {

        $validated = $request->validate([

            'meeting_id' => [
                'required',
                'integer',
                'exists:meetings,id'
            ],

            'student_id' => [
                'required',
                'string',
                'exists:users,student_id'
            ],

            'status' => [
                'nullable',
                'in:present,late,absent,excused'
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
            )->first();


        if (!$student) {

            return response()->json([

                'message' =>
                    'Student not found.'

            ], 404);

        }


        /*
        |--------------------------------------------------------------------------
        | STUDENT ROLE CHECK
        |--------------------------------------------------------------------------
        */

        if (
            $student->role !==
            'student'
        ) {

            return response()->json([

                'message' =>
                    'This account is not a student account.'

            ], 422);

        }


        /*
        |--------------------------------------------------------------------------
        | FIND MEETING
        |--------------------------------------------------------------------------
        */

        $meeting =
            Meeting::find(
                $validated['meeting_id']
            );


        if (!$meeting) {

            return response()->json([

                'message' =>
                    'Meeting not found.'

            ], 404);

        }


        /*
        |--------------------------------------------------------------------------
        | ORGANIZATION CHECK
        |--------------------------------------------------------------------------
        |
        | Student must belong to the same
        | organization as the meeting.
        |
        */

        if (
            (int) $student->organization_id !==
            (int) $meeting->organization_id
        ) {

            return response()->json([

                'message' =>
                    'Student does not belong to this organization.'

            ], 422);

        }


        /*
        |--------------------------------------------------------------------------
        | PREVENT DUPLICATE ATTENDANCE
        |--------------------------------------------------------------------------
        */

        $existing =
            Attendance::where(
                'meeting_id',
                $meeting->id
            )
            ->where(
                'user_id',
                $student->id
            )
            ->first();


        if ($existing) {

            return response()->json([

                'message' =>
                    'Attendance has already been recorded for this student.',

                'attendance' =>
                    $existing->load([
                        'meeting.organization',
                        'student.organization'
                    ]),

            ], 409);

        }


        /*
        |--------------------------------------------------------------------------
        | CREATE ATTENDANCE
        |--------------------------------------------------------------------------
        */

        $attendance =
            Attendance::create([

                'meeting_id' =>
                    $meeting->id,

                'user_id' =>
                    $student->id,

                'status' =>
                    $validated['status']
                    ?? 'present',

                'scanned_at' =>
                    now(),

            ]);


        return response()->json([

            'message' =>
                'Attendance recorded successfully.',

            'attendance' =>
                $attendance->load([
                    'meeting.organization',
                    'student.organization'
                ]),

        ], 201);
    }


    /**
     * Get one attendance record.
     */
    public function show(
        Attendance $attendance
    ) {

        return response()->json(

            $attendance->load([
                'meeting.organization',
                'student.organization'
            ])

        );
    }
}