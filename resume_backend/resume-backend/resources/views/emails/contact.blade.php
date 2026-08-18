<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Contact Support Message</title>
</head>

<body style="font-family: Arial, sans-serif; background:#f5f7f8; padding:30px;">

    <div style="
        max-width:600px;
        margin:auto;
        background:white;
        padding:30px;
        border-radius:12px;
        border:1px solid #ddd;
    ">

        <h2 style="color:#043442;">
            New Contact Support Message
        </h2>

        <hr>

        <p>
            <strong>Name:</strong>
            {{ $contactData['name'] }}
        </p>

        <p>
            <strong>Email:</strong>
            {{ $contactData['email'] }}
        </p>

        <p>
            <strong>Contact:</strong>
            {{ $contactData['contact'] ?? 'Not provided' }}
        </p>

        <p>
            <strong>Subject:</strong>
            {{ $contactData['subject'] }}
        </p>

        <p>
            <strong>Message:</strong>
        </p>

        <div style="
            background:#f8fafb;
            padding:15px;
            border-radius:8px;
            line-height:1.6;
        ">
            {{ $contactData['message'] }}
        </div>

        <hr>

        <p style="font-size:12px;color:#777;">
            This message was sent from the AI Resume Builder contact form.
        </p>

    </div>

</body>
</html>