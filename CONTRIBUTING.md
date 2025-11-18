# Contributing to NPM-PACKAGE-DOWNLOAD-STAT

First off, thank you for considering contributing to NPM-PACKAGE-DOWNLOAD-STAT! It's people like you that make this project great.

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots if applicable**
- **Specify the browser and OS you're using**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Include screenshots and animated GIFs in your pull request whenever possible
- Follow the TypeScript and React styleguides
- Include thoughtfully-worded, well-structured tests
- Document new code based on the Documentation Styleguide
- End all files with a newline

## Development Process

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/npm-package-download-stat.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Make your changes
6. Test your changes: `npm run build` and `npm run lint`
7. Commit your changes: `git commit -m "Add some feature"`
8. Push to your branch: `git push origin feature/your-feature-name`
9. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── page.tsx          # Main page
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── lib/                  # Utility functions
├── public/               # Static assets
└── ...config files
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` type - use proper types or `unknown`
- Use interfaces for object shapes
- Use type aliases for unions and intersections
- Export types and interfaces that are used outside the module

### React

- Use functional components with hooks
- Use `useState` and `useEffect` appropriately
- Extract reusable logic into custom hooks
- Use proper prop types with TypeScript interfaces
- Keep components small and focused

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Use trailing commas in arrays and objects
- Use semicolons at the end of statements
- Maximum line length: 100 characters
- Use meaningful variable and function names

### File Naming

- Components: PascalCase (e.g., `DownloadChart.tsx`)
- Utilities: camelCase (e.g., `npm-api.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

**Examples:**

```
feat(charts): Add colorful bars to download charts

fix(api): Handle 404 errors for non-existent packages

docs(readme): Update installation instructions
```

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- Test in both light and dark modes
- Test responsive design on mobile devices

## Documentation

- Update README.md if needed
- Add JSDoc comments for new functions
- Update API documentation if you change API routes
- Include examples in your documentation

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the CHANGELOG.md with your changes
3. Ensure your code follows the style guidelines
4. Ensure your code passes all tests and linting
5. Request review from maintainers
6. Address review comments
7. Once approved, maintainers will merge your PR

## Questions?

Feel free to open an issue for any questions you might have about contributing.

Thank you for contributing! 🎉
