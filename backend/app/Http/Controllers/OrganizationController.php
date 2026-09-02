<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    public function index()
    {
        return response()->json(
            Organization::with('users')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:255', 'unique:organizations,code'],
            'logo' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $organization = Organization::create($validated);

        return response()->json($organization, 201);
    }

    public function show(Organization $organization)
    {
        return response()->json(
            $organization->load('users')
        );
    }
}