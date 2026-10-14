describe('PayRakshak smoke tests', () => {
  it('loads the home page', () => {
    cy.visit('/')
    cy.contains('PayRakshak').should('be.visible')
  })

  it('navigates to public case tracker', () => {
    cy.visit('/track')
    cy.get('[id="track-case-input"]').should('exist')
  })

  it('login page renders and shows form', () => {
    cy.visit('/login')
    cy.get('[id="email"]').should('exist')
    cy.get('[id="password"]').should('exist')
    cy.get('button[type="submit"]').should('exist')
  })

  it('register page renders', () => {
    cy.visit('/register')
    cy.get('[id="name"]').should('exist')
    cy.get('[id="email"]').should('exist')
  })

  it('language toggle is visible on home page', () => {
    cy.visit('/')
    cy.get('[id="lang-toggle"]').should('exist')
  })
})
