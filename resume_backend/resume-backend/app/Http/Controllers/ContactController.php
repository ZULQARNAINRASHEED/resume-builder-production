<?php

namespace App\Http\Controllers;

use App\Mail\ContactMessageMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email',
            'contact' => 'nullable|string|max:30',
            'subject' => 'required|string|max:150',
            'message' => 'required|string|max:5000',
        ]);

        try {

            Mail::to(env('MAIL_USERNAME'))->send(
                new ContactMessageMail($validated)
            );

            return response()->json([
                'success' => true,
                'message' => 'Your message has been sent successfully!'
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Unable to send message. Please try again later.'
            ], 500);
        }
    }
}