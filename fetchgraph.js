export async function fetchGraphData(query, variables = {}) {
  const token = localStorage.getItem("jwt");

  if (!token) {
    throw new Error("Authentication token not found");
  }

  try {
    const response = await fetch("https://learn.reboot01.com/api/graphql-engine/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message || "GraphQL query error");
    }

    return data.data;
  } catch (error) {
    console.error("GraphQL request error:", error);
    throw error;
  }
}
