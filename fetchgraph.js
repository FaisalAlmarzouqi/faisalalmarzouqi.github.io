export async function fetchGraphData(query) {

  const token = localStorage.getItem("jwt"); // <- match the key name

  if (!token) {
    throw new Error("No auth token found. Please log in.");
  }
  
  const response = await fetch("/fetch-graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data from GraphQL");
  }

  const data = await response.json();
  return data;
}
