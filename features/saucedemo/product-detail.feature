@regression @product-detail
Feature: SauceDemo product detail
  As a logged-in user
  I want to view individual product detail pages
  So that I can review product info and manage my cart from the detail view

  Rule: Product detail content and cart interactions

    Background:
      Given I am logged in as "standard_user"

    # --- EP: Equivalence Partitioning ---

    @smoke
    Scenario: Product detail page displays all product information
      When I navigate to the product detail page for item 4
      Then the product name should not be empty
      And the product description should not be empty
      And the product price should not be empty
      And the product image should be visible

    @smoke
    Scenario: Add to Cart button is visible when item is not in cart
      When I navigate to the product detail page for item 4
      Then the add to cart button should be visible
      And the remove button should not be visible

    # --- BVA: Boundary Value Analysis ---

    @regression
    Scenario Outline: Valid product ID boundary values load the detail page
      When I navigate to the product detail page for item <id>
      Then the product name should not be empty
      And the product image should be visible

      Examples:
        | id |
        | 0  |
        | 5  |

    # --- ST: State Transition ---

    @smoke
    Scenario: Add to Cart changes button state to Remove
      When I navigate to the product detail page for item 4
      And I add the product to cart from the detail page
      Then the remove button should be visible
      And the add to cart button should not be visible

    @smoke
    Scenario: Remove changes button state back to Add to Cart
      When I navigate to the product detail page for item 4
      And I add the product to cart from the detail page
      And I remove the product from the detail page
      Then the add to cart button should be visible
      And the remove button should not be visible

    @smoke
    Scenario: Add to Cart increments cart badge
      When I navigate to the product detail page for item 4
      And I add the product to cart from the detail page
      Then the cart badge should show "1"

    @smoke
    Scenario: Remove hides cart badge
      When I navigate to the product detail page for item 4
      And I add the product to cart from the detail page
      And I remove the product from the detail page
      Then the cart badge should not be visible

    @smoke
    Scenario: Back to Products navigates to inventory page
      When I navigate to the product detail page for item 4
      And I click Back to Products
      Then I should be on the inventory page

    # --- DT: Decision Table (button state vs cart state) ---

    @regression
    Scenario: Remove button is visible when item is already in cart
      When I navigate to the product detail page for item 4
      And I add the product to cart from the detail page
      And I navigate to the product detail page for item 4
      Then the remove button should be visible
      And the add to cart button should not be visible

    # --- EG: Error Guessing ---

    @regression
    Scenario: Navigate to product detail via inventory item name link
      When I click the first product name on the inventory
      Then I should be on the product detail page

    @regression
    Scenario: Navigate to product detail via inventory item image link
      When I click the first product image on the inventory
      Then I should be on the product detail page

    @regression
    Scenario: Cart badge count is preserved after navigating Back to Products
      When I navigate to the product detail page for item 4
      And I add the product to cart from the detail page
      And I click Back to Products
      Then the cart badge should show "1"

  Rule: Access control

    # --- EG: Error Guessing (unauthenticated) ---

    @regression
    Scenario: Unauthenticated user accessing product detail URL is redirected to login
      Given I am not logged in
      When I navigate to the product detail page for item 4
      Then I should be on the login page
