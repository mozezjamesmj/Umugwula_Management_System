# Association Management App - Reorganized

This project has been reorganized from a single-file JSX application into a scalable, modular folder structure following modern JavaScript and React best practices.

## Folder Structure

```text
src/
├── components/          # Reusable UI and business components
│   ├── auth/            # Authentication related components (LoginModal)
│   └── ui/              # Generic UI components (Btn, Input, Modal, etc.)
├── config/              # Application configuration and constants
│   ├── constants.js     # Color palette and financial constants
│   └── tabs.js          # Navigation tab configuration
├── data/                # Initial seed data
│   └── seedData.js      # Members, Levies, Expenses, and Meetings seeds
├── pages/               # Main view components for each tab
│   ├── Dashboard.jsx
│   ├── Members.jsx
│   ├── Levies.jsx
│   ├── Expenses.jsx
│   └── Meetings.jsx
├── utils/               # Utility functions
│   └── helpers.js       # Formatting and date helpers
├── App.jsx              # Main application shell and state management
└── index.js             # Entry point
```

## Key Changes

1.  **Modularity**: Each component and page is now in its own file, making the codebase easier to navigate and maintain.
2.  **Centralized Config**: Constants like `COLORS`, `REG_FEE`, and `LEVY_AMOUNT` are centralized in `src/config/constants.js`.
3.  **Separation of Concerns**: Utility functions are moved to `src/utils/helpers.js`, and seed data is moved to `src/data/seedData.js`.
4.  **Scalable Structure**: The new structure allows for easy addition of new features, components, and pages without cluttering the main `App` component.
5.  **Updated Imports**: All files have been updated with relative imports to ensure they work correctly within the new structure.
