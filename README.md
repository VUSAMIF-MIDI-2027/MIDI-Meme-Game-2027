# MIDI Meme Game

A meme competition for **Naktis su MIDI**, planned for `midi.lt/memes`.

Participants choose a photo uploaded by the organisers, write a caption, and submit a meme. The organisers select three winners and publish the results alongside a gallery of selected entries.

## How it works

| Stage | What visitors and participants see |
| --- | --- |
| Before the event | A short introduction, the opening time, and a countdown. |
| During the event | Registration, sign-in, meme creation, and the **Mano memai** page. |
| Judging | A message that submissions are closed and results are being prepared. |
| After publication | A public leaderboard and meme gallery, accessible without an account. |

## Participant features

- Register individually and verify your email through Clerk.
- Choose an organiser-uploaded photo and preview your caption below it.
- Submit as many memes as you like while the competition is open. Each caption can contain up to 30 words and 250 characters.
- View, edit, or delete your own memes before submissions close.

## Admin features

- Upload and manage source photos.
- Open and close the competition.
- Review submissions privately, remove inappropriate entries, and choose which memes appear in the public gallery.
- Select first, second, and third place, then publish the winners and gallery together.
- Notify winners by email with prize collection instructions.

The leaderboard shows each winner’s place, first name, last name, and meme. The gallery shows the other entries selected for publication. Internal reviews and participant email addresses remain private.

## Technical overview

- **Frontend:** Responsive Lithuanian interface based on the MIDI design in Figma.
- **Authentication:** Clerk handles accounts, email verification, and sessions. The backend checks access and competition state.
- **Database:** SQLite stored in a persistent file.
- **Photo storage:** Uploaded photos are stored as server files. SQLite stores their relative paths. Backups cover both the database and uploaded photos.

## Project tracking

Frontend and backend work is tracked in GitHub Issues. Feature details, API endpoints, and acceptance criteria belong in the relevant issues.
