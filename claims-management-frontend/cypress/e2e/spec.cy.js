describe("Claims Management System - Automation Tests", () => {
  it("Should load the homepage successfully", () => {
    cy.visit("https://claim-management-system-1-5pzo.onrender.com/");
    cy.contains("Secure Your Future with Easy Insurance Claims").should("be.visible");
  });

  it("Should navigate to the Signup page", () => {
    cy.visit("https://claim-management-system-1-5pzo.onrender.com/signup");
    cy.url().should("include", "/signup");
  });

  it("Should successfully register a new user", () => {
    cy.visit("https://claim-management-system-1-5pzo.onrender.com/signup");
    cy.get("input[name='name']").type("Test User");
    cy.get("input[name='email']").type("testus@example.com");
    cy.get("input[name='password']").type("password123");
    cy.get("input[name='confirmPassword']").type("password123");
    cy.get("button").contains("Create Account").click();
    cy.contains("Registration successful! Redirecting...").should("be.visible");
  });

  it("Should login and logout successfully", () => {
    cy.visit("https://claim-management-system-1-5pzo.onrender.com/login");
    cy.get("input[name='email']").type("ayushanand667@gmail.com");
    cy.get("input[name='password']").type("123ayush");
    cy.get("button").contains("Login").click();
    cy.url().should("include", "/user-dashboard");
    cy.get("button").contains("Logout").click();
    cy.url().should("include", "/login");
  });


  it("Should allow an admin to login and manage claims", () => {
    cy.visit("https://claim-management-system-1-5pzo.onrender.com/login");
    cy.get("input[name='email']").type("adhmina@example.com");
    cy.get("input[name='password']").type("adminpassword");
    cy.get("button").contains("Login").click();
    cy.url().should("include", "/admin-dashboard");
    cy.visit("https://claim-management-system-1-5pzo.onrender.com/admin/manage-claims");
    cy.contains("Manage Claims").should("be.visible");
  });
});
