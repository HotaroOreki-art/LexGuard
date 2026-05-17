fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contractText: "This is a test contract." })
})
.then(async (res) => {
  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("RESPONSE:", text);
})
.catch(console.error);
