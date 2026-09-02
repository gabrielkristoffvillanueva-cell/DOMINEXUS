<?php

namespace App\Http\Controllers;

use App\Models\RequestModel;
use App\Models\Meeting;
use App\Models\User;
use Illuminate\Http\Request;

class RequestController extends Controller
{
    /**
     * Get requests.
     *
     * Optional:
     * ?student_id=042525
     */
    public function index(Request $request)
    {
        $query = RequestModel::with([
            'meeting.organization',
            'student.organization'
        ]);

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

        $requests = $query
            ->latest()
            ->get();

        return response()->json(
            $requests
        );
    }


    /**
     * Submit a student request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([

            'student_id' => [
                'required',
                'string',
                'exists:users,student_id'
            ],

            'meeting_id' => [
                'required',
                'integer',
                'exists:meetings,id'
            ],

            'request_type' => [
                'required',
                'string',
                'max:255'
            ],

            'meeting_date' => [
                'required',
                'date'
            ],

            'reason' => [
                'required',
                'string',
                'max:500'
            ],

            'supporting_document' => [
                'nullable',
                'string',
                'max:255'
            ],

        ]);


        $student = User::where(
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


        $meeting = Meeting::find(
            $validated['meeting_id']
        );


        if (
            (int) $student->organization_id !==
            (int) $meeting->organization_id
        ) {

            return response()->json([
                'message' =>
                    'Student does not belong to this organization.'
            ], 422);

        }


        $requestRecord =
            RequestModel::create([

                'user_id' =>
                    $student->id,

                'meeting_id' =>
                    $meeting->id,

                'request_type' =>
                    $validated['request_type'],

                'meeting_date' =>
                    $validated['meeting_date'],

                'reason' =>
                    $validated['reason'],

                'supporting_document' =>
                    $validated[
                        'supporting_document'
                    ] ?? null,

                'status' =>
                    'pending',

                'officer_remarks' =>
                    null,

            ]);


        return response()->json([

            'message' =>
                'Request submitted successfully.',

            'request' =>
                $requestRecord->load([
                    'meeting.organization',
                    'student.organization'
                ]),

        ], 201);
    }


    /**
     * Get one request.
     */
    public function show(
        RequestModel $requestModel
    ) {

        return response()->json(
            $requestModel->load([
                'meeting.organization',
                'student.organization'
            ])
        );

    }


    /**
     * Approve a student request.
     */
    public function approve(
        Request $request,
        $id
    ) {

        $validated = $request->validate([

            'officer_id' => [
                'required',
                'string'
            ],

            'officer_remarks' => [
                'nullable',
                'string',
                'max:500'
            ],

        ]);


        /*
         * Verify that the officer exists
         * and is active.
         */

        $officer = User::where(
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
                    'Unauthorized officer access.'
            ], 403);

        }


        /*
         * Find pending request.
         */

        $requestRecord =
            RequestModel::where(
                'id',
                $id
            )
            ->where(
                'status',
                'pending'
            )
            ->first();


        if (!$requestRecord) {

            return response()->json([
                'message' =>
                    'Pending request not found.'
            ], 404);

        }


        /*
         * Update request.
         */

        $requestRecord->status =
            'approved';


        $requestRecord->officer_remarks =
            $validated[
                'officer_remarks'
            ] ?? null;


        $requestRecord->save();


        return response()->json([

            'message' =>
                'Request approved successfully.',

            'request' =>
                $requestRecord->load([
                    'meeting.organization',
                    'student.organization'
                ]),

        ]);

    }


    /**
     * Reject a student request.
     */
    public function reject(
        Request $request,
        $id
    ) {

        $validated = $request->validate([

            'officer_id' => [
                'required',
                'string'
            ],

            'officer_remarks' => [
                'nullable',
                'string',
                'max:500'
            ],

        ]);


        /*
         * Verify officer.
         */

        $officer = User::where(
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
                    'Unauthorized officer access.'
            ], 403);

        }


        /*
         * Find pending request.
         */

        $requestRecord =
            RequestModel::where(
                'id',
                $id
            )
            ->where(
                'status',
                'pending'
            )
            ->first();


        if (!$requestRecord) {

            return response()->json([
                'message' =>
                    'Pending request not found.'
            ], 404);

        }


        /*
         * Update request.
         */

        $requestRecord->status =
            'rejected';


        $requestRecord->officer_remarks =
            $validated[
                'officer_remarks'
            ] ?? null;


        $requestRecord->save();


        return response()->json([

            'message' =>
                'Request rejected successfully.',

            'request' =>
                $requestRecord->load([
                    'meeting.organization',
                    'student.organization'
                ]),

        ]);

    }
}