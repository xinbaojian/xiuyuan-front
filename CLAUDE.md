# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 Admin Better - A high-performance admin dashboard framework using Vue 3, Element Plus, and Rspack for 5-second build times. Implements RBAC permissions with JWT authentication.

## Development Commands

```bash
# Install dependencies (Node.js >= 16.0.0 required)
npm install

# Start development server
npm run serve:rspack

# Build for production (outputs to dist/)
npm run build

# Build and zip for deployment
npm run build:zip

# Clear node_modules and reinstall
npm run clear

# Update dependencies
npm run update
```

## Architecture & Key Patterns

### Permission System
- **v-permissions directive**: Use `v-permissions="['admin']"` on elements for permission control
- **checkPermission function**: Import from `@/utils/permission` for complex permission logic
- **Permission storage**: Retrieved from Vuex store at `user/permissions` state
- **Note**: The v-permissions directive uses Vue 2's `inserted` hook, which needs to be changed to `mounted` for Vue 3 compatibility

### API Structure
- API modules in `src/api/` handle all backend communication
- Mock server enabled in development mode (port 8081)
- Base URL configuration in `src/config/net.config.js`
- Success codes: [200, 0], Login invalid: 402, No permission: 401

### Component Organization
- **Layouts**: `src/layouts/` - Main layout components, sidebars, navigation
- **Views**: `src/views/` - Page components organized by feature
- **Components**: `src/components/` - Reusable UI components
- **Icon Mapping**: FontAwesome icons mapped to Element Plus icons via `src/utils/vab.js` faToElIcon function

### Router Configuration
- Dynamic routing based on permissions in `src/router/index.js`
- Routes define permission requirements in `meta.permissions` array
- System settings routes grouped under `/setting` path

### State Management
- Vuex store modules in `src/store/modules/`
- User state contains permissions: `state.permissions`
- Token management via `src/utils/accessToken.js`

### Build Configuration
- Uses Rspack (not Webpack) for faster builds
- Configuration in `rspack.config.js`
- Supports TypeScript declarations via `components.d.ts`
- CSS preprocessing with Sass

### Common Development Tasks
- **Adding new pages**: Create view in `src/views/`, add route with permissions, create API service if needed
- **API mocking**: Mock data handled by MockJS, configured in development server
- **Theme switching**: Dynamic themes supported via Element Plus, config in `src/config/theme.config.js`