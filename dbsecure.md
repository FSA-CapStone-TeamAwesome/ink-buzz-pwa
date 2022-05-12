rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /{document=\*\*} {
allow read, write: if request.auth !=null
}
}
}

//TO BE ADDED WHEN WE CHANGE DATA ORGANIZATION

//match /{userUID}{
//allow write if request.auth.uid == userUID || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.admin == true
//}

//drawback, you do not get feedback back for rejected calls

//get - part of read umbrella - good for using validation
//list - part of read umbrella
//create
//delete
//update
// /databases/{authId} is equivalent to the api route /databases/:authid

//requests are contained within the request object, which is just called request
//db items are contained within the resourse object which is just called resource

//https://www.youtube.com/watch?v=eW5MdE3ZcAw&t=208s
//https://firebase.google.com/docs/firestore/security/rules-conditions

//allow read: if resource.data.reviewerId == request.auth.uid

// allow update: if get(/databases/$(database)/documents/restaurants/$()restaurantId)/private_data/private).data.roles(request.auth.uid) in ['editor', 'owner']

//you can create functions

---

**START OF STORAGE**
rules_version = '2';
service firebase.storage {
match /b/{bucket}/o {
match /{allPaths=**} {
allow read: if request.auth != null;
}
match /images/universal/{userUID}/{documents=**} {
allow write: if request.auth.uid == userUID
}
}
}

**END OF STORAGE**

//Any user can see any file, but only users can edit files within their folder.
