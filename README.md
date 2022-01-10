# atlas-api

A closed-group social networking platform that allows mentors/advisors/investors to input their information and add their schedules onto one public user interface where then students can book one-on-one times with them from that same public link.

Uses Node.js, Express, Socket.io, GCP, MongoDB for backend

How to run it:
- run "glcoud auth login" and login into your google account. Set the project_ID to atlasplanner.
- run "export GOOGLE_APPLICATION_CREDENTIALS=" and set it to the pathway
of that project's secrets **DO NOT PUSH SECRETS IN REPO, IF SO --> DELETE/ROTATE SECRET**
- run "node server.js"
- server should be listening at port 8080 locally