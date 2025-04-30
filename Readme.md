# GraphQL Profile Page

This project is a personal profile page built using **GraphQL**, **JWT authentication**, and **React**. It allows users to log in, fetch their school-related data, and visualize their progress with interactive SVG-based graphs.

##  Features
- **User Authentication** (JWT-based login)
- **GraphQL API Integration** (Fetch user data, XP, grades, etc.)
- **Profile Page** (Displays user stats)
- **Statistics Graphs** (SVG-based visualizations)
- **Hosting** (Deployed using Netlify & Render)

## Technologies Used
- **Backend:** Node.js, Express.js, GraphQL, JWT
- **Frontend:** React.js, SVG for graphs
- **Hosting:** Netlify (Frontend), Render (Backend)

##  Setup & Installation

### 1️ Clone the repository
```sh
git clone https://github.com/your-username/graphql-profile.git
cd graphql-profile

##  Project Objective

The objective of this project is to learn the GraphQL query language by creating your own profile page using:

- The GraphQL endpoint: `https://learn.reboot01.com/api/graphql-engine/v1/graphql`
- JWT for authentication via: `https://learn.reboot01.com/api/auth/signin`

---

## Requirements

- Login page with JWT auth (Basic Auth using `username:password` or `email:password`)
- Profile must show **at least 3** pieces of user information:
  - Basic identification (e.g., username)
  - XP amount
  - Audits or Skills
- Include **at least 2 SVG-based statistical graphs**, such as:
  - XP over time
  - XP by project
  - Audit ratio (up/down)
  - Pass/fail ratios
- Implement **GraphQL queries** including:
  - Normal queries
  - Queries with arguments
  - Nested queries

---

##  Graph Examples

- XP earned over time from `transaction` table (type = xp)
- XP by project using `object` and `transaction`
- Audit ratio using `transaction` type = "up" and "down"

---

##  Authentication Flow

- Use `POST` to `/api/auth/signin` with Basic Auth to retrieve a JWT
- Store JWT and use it in `Authorization: Bearer <token>` for GraphQL queries
- On login failure, display a proper error message
- Include a logout method

---

##  GraphQL Table References

### user

| id | login     |
|----|-----------|
| 1  | person1   |

### transaction

| id | type | amount | userId | createdAt |
|----|------|--------|--------|-----------|
| 1  | xp   | 234    | 1      | ...       |

### progress

| id | userId | grade | path                           |
|----|--------|-------|--------------------------------|
| 1  | 1      | 1     | /madere/piscine-go/quest-01    |

### result

| id | userId | grade | path                      |
|----|--------|-------|---------------------------|
| 1  | 1      | 1     | /madere/div-01/graphql     |

---

## GraphQL Example Queries

### Basic Query

```graphql
{
  user {
    id
    login
  }
}
```

### Query with Arguments

```graphql
{
  object(where: { id: { _eq: 3323 }}) {
    name
    type
  }
}
```

### Nested Query

```graphql
{
  result {
    id
    user {
      id
      login
    }
  }
}
```

---

## Hosting

- GitHub Pages

---

##  Learnings & Concepts

- GraphQL (queries, nesting, variables)
- GraphiQL (query exploration)
- Authentication and JWT
- React.js UI with interactive SVG charts
- Hosting frontend and backend

---

##  Author

Made by **Faisal Hesham Almarzouqi** ([@FaisalAlmarzouqi](https://github.com/FaisalAlmarzouqi))

---
