async function test() {
  try {
    // 1. Get token
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@campushive.com',
        password: 'admin123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;

    // 2. Prepare payload
    const rows = [
      { originalIndex: 2, data: { name: "New User 1", email: "new1@uni.edu", dob: "2001-01-01", department: "CSE", batch: "2023-2024" } },
      { originalIndex: 3, data: { name: "New User 2", email: "new2@uni.edu", dob: "2001-01-01", department: "CSE", batch: "2023-2024" } },
      { originalIndex: 4, data: { name: "Dup Batch User", email: "new1@uni.edu", dob: "2001-01-01", department: "CSE", batch: "2023-2024" } },
      { originalIndex: 5, data: { name: "Dup DB User", email: "admin@campushive.com", dob: "2001-01-01", department: "CSE", batch: "2023-2024" } },
      { originalIndex: 6, data: { name: "Invalid Email", email: "bademail", dob: "2001-01-01", department: "CSE", batch: "2023-2024" } },
      { originalIndex: 7, data: { name: "Missing fields", email: "new3@uni.edu", dob: "2001-01-01", department: "", batch: "2023-2024" } },
    ];

    // 3. Send request
    console.log("Sending bulk-import request...");
    const res = await fetch('http://localhost:5000/api/students/bulk-import', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ rows })
    });

    const resData = await res.json();
    console.log("Response:", JSON.stringify(resData, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
