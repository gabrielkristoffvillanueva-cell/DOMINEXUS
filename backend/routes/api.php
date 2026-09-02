<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\RequestController;



Route::get('/organizations', [OrganizationController::class, 'index']);
Route::post('/organizations', [OrganizationController::class, 'store']);
Route::get('/organizations/{organization}', [OrganizationController::class, 'show']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/change-password', [AuthController::class, 'changePassword']);
Route::post('/officer-register', [AuthController::class, 'officerRegister']);
Route::post('/officer-login', [AuthController::class, 'officerLogin']);
Route::post('/moderator-login', [AuthController::class, 'moderatorLogin']);
Route::get('/officer-applications', [AuthController::class, 'officerApplications']);
Route::post('/officer-applications/{id}/approve', [AuthController::class, 'approveOfficer']);
Route::post('/officer-applications/{id}/reject', [AuthController::class, 'rejectOfficer']);
Route::get('/students/by-student-id/{studentId}', [AuthController::class, 'findStudentByStudentId']);
Route::get('/students/{uniqueId}',
[AuthController::class, 'findStudent']);
Route::get('/meetings',[MeetingController::class, 'index']);
Route::post('/meetings',[MeetingController::class, 'store']);
Route::get('/meetings/{meeting}',[MeetingController::class, 'show']);
Route::put('/meetings/{id}',[MeetingController::class, 'update']);
Route::delete('/meetings/{id}',[MeetingController::class, 'destroy']);
Route::post('/attendances', [AttendanceController::class, 'store']);
Route::get('/attendances',[AttendanceController::class, 'index']);
Route::get('/attendances/{attendance}', [AttendanceController::class, 'show']);
Route::get('/students/by-student-id/{studentId}',
    [AuthController::class, 'findStudentByStudentId']);
Route::get('/requests', [RequestController::class, 'index']);
Route::post('/requests', [RequestController::class, 'store']);
Route::get('/requests/{requestModel}', [RequestController::class, 'show']);
Route::put('/requests/{id}/approve',[RequestController::class, 'approve']);
Route::put('/requests/{id}/reject',[RequestController::class, 'reject']);
Route::get('/moderator-dashboard', [AuthController::class, 'moderatorDashboard']);
Route::get('/moderator-students',[AuthController::class, 'moderatorStudents']);
Route::post('/moderator/reset-student-password',[AuthController::class, 'moderatorResetStudentPassword']);
Route::get('/officer-dashboard', [AuthController::class, 'officerDashboard']);
Route::get('/officer-members',[AuthController::class, 'officerMembers']);
Route::put('/officer-profile',[AuthController::class, 'updateOfficerProfile']);
Route::put('/officer-password',[AuthController::class, 'updateOfficerPassword']);
Route::get('/moderator-attendance-history',[AuthController::class, 'moderatorAttendanceHistory']);
Route::get('/moderator-reports',[AuthController::class, 'moderatorReports']);
Route::get('/moderator-notifications',
[AuthController::class, 'moderatorNotifications']);