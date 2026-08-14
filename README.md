Meeting Room

A full-stack real-time meeting application built with React, Node.js,
Express, MongoDB, Socket.IO, WebRTC, and Cloudinary.

The project provides a browser-based meeting experience with real-time
video/audio communication, chat, participant controls, waiting room
management, reactions, notifications, screen sharing, encrypted chat,
and meeting file sharing.

🚀 Features

🔐 Authentication & User Management

User registration and login

JWT-based authentication

Protected routes

User profile management

Profile picture upload

Cookie-based authentication support

🎥 Real-Time Video & Audio

WebRTC peer-to-peer video communication

Camera on/off

Microphone on/off

Real-time participant media status

Speaking detection

Screen sharing

Automatic peer connection management

ICE candidate exchange

Offer/answer signaling through Socket.IO

👥 Participant Management

Live participant list

Participant username and profile picture

Online/offline participant state

Raise hand

Pin/unpin participant

Host controls

Kick participant

Force mute participant

Disable participant camera

⏳ Waiting Room

Meeting lock

Participants can enter a waiting room when the meeting is locked

Host can see waiting users

Host can approve users

Host can reject users

Approved participants automatically enter the meeting

Waiting room controls are available to the host

💬 Real-Time Chat

Real-time meeting chat

Previous meeting messages remain accessible to participants who
rejoin

Chat continues independently of the current WebRTC connection

Message delivery/read-status features are supported by the chat
architecture

🔐 Chat Encryption

Per-user public/private key setup

Meeting encryption key

Public-key based encrypted meeting-key exchange

Participant receives the encrypted meeting key

Plain meeting encryption key is not stored directly in the Meeting
document

📁 File Sharing

Upload files during a meeting

Image/document/PDF/media support

Cloudinary-based file storage

File list for the meeting

Download files

File deletion by the uploader

Host/file-owner permission handling

Previous meeting files remain available when an authorized
participant rejoins

Real-time file upload/delete updates through Socket.IO

🔔 Notifications

Real-time notification events

User join/leave notifications

New message notifications

File upload/delete notifications

Raise-hand notifications

Waiting-room notifications

Reaction notifications

Host-action notifications

Notification bell with unread count

Mark all notifications as read

Clear notifications

😀 Reactions

Real-time emoji reactions

Reaction events broadcast through Socket.IO

Temporary reaction display

🔒 Meeting Controls

Lock/unlock meeting

Host-only meeting actions

End meeting

Meeting status management

Force mute

Force camera off

📱 Responsive UI

Responsive meeting interface

Participants drawer

Chat drawer

Waiting-room drawer for host

File drawer

Mobile/tablet/desktop support

Side drawer based meeting controls

🏗️ Architecture

                    ┌─────────────────────┐
                    │       React         │
                    │     Frontend        │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
              REST API                  Socket.IO
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐          ┌─────────────────┐
        │    Express      │          │ Socket Manager  │
        │     Server      │          │ / Socket Events │
        └────────┬────────┘          └────────┬────────┘
                 │                            │
                 └────────────┬───────────────┘
                              ▼
                     ┌─────────────────┐
                     │     MongoDB     │
                     │     Database    │
                     └─────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │   Cloudinary    │
                     │ Profile / Files │
                     └─────────────────┘

                 WebRTC
        Browser ◄──────────────► Browser
          │                         │
          └──── Socket.IO signaling┘

🧰 Tech Stack

Frontend

React

React Router

Axios

Socket.IO Client

WebRTC

Lucide React

Tailwind CSS / utility-based responsive styling

Backend

Node.js

Express.js

MongoDB

Mongoose

Socket.IO

JWT

bcrypt

cookie-parser

CORS

dotenv

http-status

Storage & Media

Cloudinary

Multer

multer-storage-cloudinary

📂 Main Project Structure

The project is divided into frontend and backend applications.

Meeting-Room/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── ...
│   │
│   └── ...
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── socket/
│   │   ├── config/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── ...
│   │
│   └── ...
│
└── README.md

The exact folder/file names can vary according to the current project
repository.

🔄 Meeting Flow

User Login
    ↓
Dashboard
    ↓
Create / Join Meeting
    ↓
Socket Connection
    ↓
Get Camera + Microphone
    ↓
Join Meeting
    ↓
Socket.IO Signaling
    ↓
WebRTC Peer Connections
    ↓
Real-Time Video + Audio

⏳ Waiting Room Flow

Participant
     ↓
Join Meeting
     ↓
Meeting Locked?
     ↓
   YES
     ↓
Waiting Room
     ↓
Host sees participant
     ↓
 ┌───────────────┐
 │               │
Approve        Reject
 │               │
 ↓               ↓
Meeting        Removed

💬 Chat Flow

User
  ↓
Chat Message
  ↓
Socket.IO
  ↓
Meeting Room
  ↓
Authorized Participants
  ↓
Encrypted Message Handling
  ↓
Chat UI

🔐 Encryption Flow

User joins meeting
       ↓
Initialize user encryption
       ↓
Generate / retrieve user key pair
       ↓
Participant publishes public key
       ↓
Host receives public key
       ↓
Meeting AES key is obtained
       ↓
AES meeting key is encrypted
using participant's public key
       ↓
Encrypted meeting key sent
       ↓
Participant decrypts with private key
       ↓
Meeting encryption key available

The Meeting model stores encrypted key material associated with users
rather than storing the plain meeting AES key.

📁 File Sharing Flow

Participant selects file
        ↓
React FilePanel
        ↓
fileService
        ↓
POST /api/files/upload
        ↓
Authentication middleware
        ↓
File controller
        ↓
File service
        ↓
Meeting + participant validation
        ↓
Cloudinary upload
        ↓
MongoDB File document
        ↓
Socket.IO "file-uploaded"
        ↓
All meeting participants update UI

Existing files can be loaded with:

GET /api/files/recent/:meetingCode

🔔 Notification Flow

Meeting Event
     ↓
createNotification()
     ↓
Socket.IO
     ↓
"notification"
     ↓
Notification state
     ↓
Notification Bell
     ↓
Notification Panel

🗄️ Important Data Models

User

Stores user account and profile information.

Meeting

Stores:

Meeting title

Meeting code

Host

Participants

Waiting users

Meeting lock state

Meeting status

Screen-sharing state

Chat settings

File-sharing settings

Meeting encryption key information

Message

Stores meeting chat messages and their related message information.

File

Stores:

Meeting

Uploader

Original file name

File URL

Cloudinary public ID

MIME type

File size

File type

Delete state

Download information

Timestamps

FileActivity

Stores file-related activity records when activity logging is used.

🌐 API Routes

The backend currently organizes APIs under:

/api/auth
/api/user
/api/meeting
/api/messages
/api/files

File API

POST   /api/files/upload
GET    /api/files/:fileId
DELETE /api/files/:fileId
GET    /api/files/download/:fileId
GET    /api/files/recent/:meetingCode

Additional file operations can include rename/history routes depending
on the current backend version.

⚡ Socket.IO Events

The meeting system uses Socket.IO for real-time communication.

Examples include:

join-room
leave-room

offer
answer
ice-candidate

user-joined
user-left

camera-status
camera-status-changed

microphone-status
microphone-status-changed

speaking-status
speaking-status-changed

raise-hand
raise-hand-changed

send-reaction
reaction-received

waiting-room-join
waiting-user
approve-user
reject-user
user-approved
user-rejected

pin-user
user-pinned

kick-user
kicked

mute-user
force-mute

disable-camera
force-camera-off

lock-meeting
meeting-lock-status

notification

file-uploaded
file-deleted
file-renamed

The exact event list may grow as additional meeting features are added.

⚙️ Environment Variables

Create a .env file in the backend according to the environment
configuration used by the project.

Example:

PORT=8000

ATLASDB_URL=your_mongodb_connection_string

FRONTEND_URL=http://localhost:5173

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_KEY=your_cloudinary_api_key
CLOUD_SECRET=your_cloudinary_api_secret

Do not commit real credentials, API keys, database passwords, or
private secrets to GitHub.

▶️ Running Locally

1. Clone the repository

git clone <your-repository-url>
cd Meeting-Room

2. Install backend dependencies

cd server
npm install

3. Configure backend environment variables

Create:

server/.env

and add the required MongoDB, Cloudinary, frontend URL, and server
configuration.

4. Start backend

npm run dev

The backend normally runs on:

http://localhost:8000

5. Install frontend dependencies

Open another terminal:

cd client
npm install

6. Start frontend

npm run dev

The frontend normally runs through the Vite development server.

🔒 Security Considerations

Authentication middleware protects private APIs.

Meeting participant authorization is checked before protected
meeting/file operations.

JWT/cookie authentication is used for authenticated requests.

Passwords are hashed before storage.

CORS is configured for the frontend origin.

Meeting encryption keys are not stored as plain AES keys in the
Meeting document.

Cloudinary credentials must remain server-side.

Environment variables must not be committed to source control.

🎯 Project Highlights

This project demonstrates practical experience with:

Full-stack JavaScript development

REST API design

Authentication and authorization

MongoDB/Mongoose data modeling

Real-time Socket.IO architecture

WebRTC signaling

Peer-to-peer media communication

Browser media APIs

Client-side encryption/key exchange

Cloud file storage

Responsive React UI

Real-time event-driven application design

Host/participant permission systems

🧠 What I Learned

Building Meeting Room involved working with several important real-world
concepts:

Managing WebRTC peer connections.

Designing Socket.IO event flows.

Synchronizing React state with real-time events.

Handling authentication across REST APIs and sockets.

Designing participant/host permissions.

Implementing waiting-room approval.

Managing encrypted meeting keys.

Uploading and distributing files through Cloudinary.

Handling reconnect/rejoin scenarios.

Building responsive meeting-room UI and side drawers.

📌 Future Improvements

Possible future enhancements:

Recording meetings

Screen-share quality optimization

Better WebRTC mesh/scaling strategy using an SFU

Advanced notification persistence

File preview improvements

Meeting analytics

Searchable chat history

Better network-quality indicators

Production deployment and monitoring

👨‍💻 Author

Subhadeep 

B.Tech CSE (AI)

⭐ Project

If you find this project useful, consider giving the repository a ⭐ on
GitHub.
