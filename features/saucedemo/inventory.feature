@regression @inventory
Feature: SauceDemo inventory
  As a logged-in user
  I want to browse and sort the product catalogue
  So that I can find products efficiently

  Rule: Authenticated inventory view

    Background:
      Given I am logged in as "standard_user"

    # --- EP: Equivalence Partitioning ---

    @smoke @sanity
    Scenario: Inventory page displays exactly 6 products
      When I navigate to the inventory page
      Then the inventory should contain 6 products

    @smoke
    Scenario: Each product has a name, price, image, and add-to-cart button
      When I navigate to the inventory page
      Then the first product should have a visible image
      And the first product should have an add-to-cart button

    # --- BVA: Boundary Value Analysis ---

    @smoke
    Scenario: Sort A to Z places Sauce Labs Backpack first
      When I navigate to the inventory page
      And I sort products by "az"
      Then the first product name should be "Sauce Labs Backpack"

    @regression
    Scenario: Sort A to Z produces fully sorted name list
      When I navigate to the inventory page
      And I sort products by "az"
      Then the product names should be sorted A to Z

    @regression
    Scenario: Sort Z to A places Test.allTheThings T-Shirt first
      When I navigate to the inventory page
      And I sort products by "za"
      Then the first product name should start with "Test.allTheThings"

    @regression
    Scenario: Sort Z to A produces fully sorted name list
      When I navigate to the inventory page
      And I sort products by "za"
      Then the product names should be sorted Z to A

    # --- ST: State Transition ---

    @smoke
    Scenario: Sort Low to High places cheapest product first
      When I navigate to the inventory page
      And I sort products by "lohi"
      Then the first product price should be "$7.99"

    @regression
    Scenario: Sort Low to High produces fully sorted price list
      When I navigate to the inventory page
      And I sort products by "lohi"
      Then the product prices should be sorted low to high

    @regression
    Scenario: Sort High to Low places most expensive product first
      When I navigate to the inventory page
      And I sort products by "hilo"
      Then the first product price should be "$49.99"

    @regression
    Scenario: Sort High to Low produces fully sorted price list
      When I navigate to the inventory page
      And I sort products by "hilo"
      Then the product prices should be sorted high to low

    @regression
    Scenario: Changing sort order updates product list order
      When I navigate to the inventory page
      And I sort products by "az"
      Then the first product name should be "Sauce Labs Backpack"
      When I sort products by "za"
      Then the first product name should start with "Test.allTheThings"

    # --- DT: Decision Table ---

    @regression
    Scenario Outline: All sort options produce a non-empty product list
      When I navigate to the inventory page
      And I sort products by "<option>"
      Then the inventory should contain 6 products

      Examples:
        | option |
        | az     |
        | za     |
        | lohi   |
        | hilo   |

    # --- EG: Error Guessing ---

    @regression
    Scenario: Page title is Products on the inventory page
      When I navigate to the inventory page
      Then the inventory page title should be "Products"

    # --- Visual regression ---

    @visual @regression @no-retry
    Scenario: Visual snapshot — inventory page layout matches baseline
      When I navigate to the inventory page
      Then the inventory should contain 6 products

  Rule: Access control

    @regression
    Scenario: Unauthenticated user accessing inventory URL is redirected to login
      Given I am not logged in
      When I navigate directly to the inventory URL
      Then I should be on the login page
