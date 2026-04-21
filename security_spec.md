# Security Specification - fleur

## Data Invariants
1. Products must have a name, slug, and price.
2. Orders must contain customer info and items with a status 'pending' on creation.
3. Settings is a single document ('main').
4. Config 'security' doc holds the password.

## The Dirty Dozen Payloads
1. Create a product with a 2MB image URL string.
2. Create an order with an empty items array.
3. Update config/security without knowing the current password (client-side lock).
4. Delete all products as an unauthenticated user.
5. Create a product with a negative price.
6. Create an order with a 'delivered' status immediately.
7. Inject a script in the product description.
8. Read all orders as a standard customer.
9. Change the name of a product owned by someone else (not applicable, global owner).
10. Overflow the stock count with a massive number.
11. Update settings/main as a standard customer.
12. Fetch the adminPassword doc directly.

## Rules Design
- **Products**: Public Read (if active). Write requires validation.
- **Orders**: Create allowed (pending only). Read/Update restricted.
- **Settings**: Public Read. Write restricted.
- **Config**: Get allowed for password verification. Update restricted.

*Note: Since Firebase Auth is not yet used for fine-grained roles, we will use structural validation to prevent "Resource Poisoning" and "Identity Spoofing".*
