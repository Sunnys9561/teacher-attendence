
import { NextResponse } from 'next/server';
import type { User } from '@/types';
import nodemailer from 'nodemailer';

// This function simulates fetching user data from a central database.
// In a real application, you would replace this with actual database query logic.
async function getUsersForExport(): Promise<Omit<User, 'password'>[]> {
  // ** START DATABASE FETCH SIMULATION / PLACEHOLDER **
  // Demo teacher users removed. In a real app, this would query your actual DB.
  const mockUsers: Omit<User, 'password'>[] = []; 
  // ** END DATABASE FETCH SIMULATION / PLACEHOLDER **

  return mockUsers;
}

function convertToCSV(data: Omit<User, 'password'>[]): string {
  if (!data || data.length === 0) {
    return 'id,username,name\n'; // Header only if no data
  }
  const header = ['id', 'username', 'name'];
  const csvRows = [
    header.join(','),
    ...data.map(user =>
      [
        `"${user.id}"`,
        `"${user.username}"`,
        `"${user.name}"`
      ].join(',')
    )
  ];
  return csvRows.join('\n');
}

export async function POST() {
  try {
    const users = await getUsersForExport();
    const csvData = convertToCSV(users);
    const emailTo = 'sashirsath25@gmail.com'; // Hardcoded recipient
    const emailSubject = 'Teacher Data Export';
    const emailBody = 'Please find attached the teacher data CSV, fetched from the (simulated) central database.';
    const attachmentFilename = `teacher_data_central_${new Date().toISOString().split('T')[0]}.csv`;

    // Nodemailer setup
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;

    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) {
      console.error('Email service is not configured. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, and EMAIL_FROM environment variables.');
      return NextResponse.json({
        success: false,
        message: 'Email service not configured on the server. Data prepared but not sent.',
        csvPreview: csvData // Still provide CSV for preview if email fails due to config
      }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT, 10),
      secure: parseInt(EMAIL_PORT, 10) === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `"TimeWise Attendance Admin" <${EMAIL_FROM}>`,
        to: emailTo,
        subject: emailSubject,
        html: `<p>${emailBody}</p>`,
        attachments: [
          {
            filename: attachmentFilename,
            content: csvData,
            contentType: 'text/csv',
          },
        ],
      });
      console.log(`Email successfully sent to: ${emailTo}`);
      let message = `Teacher data CSV successfully sent to ${emailTo}.`;
      if (users.length === 0) {
          message = `Teacher data CSV sent to ${emailTo} (no teacher users found in this simulated DB export).`
      }
      return NextResponse.json({ success: true, message: message, csvPreview: csvData }, { status: 200 });

    } catch (emailError) {
      console.error('Error sending email with Nodemailer:', emailError);
      return NextResponse.json({
        success: false,
        message: 'Teacher data prepared, but failed to send email. Check server logs.',
        csvPreview: csvData
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in export-teachers API route:', error);
    // Check if error is an instance of Error to safely access message property
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ success: false, message: `Failed to prepare teacher data for export: ${errorMessage}` }, { status: 500 });
  }
}
