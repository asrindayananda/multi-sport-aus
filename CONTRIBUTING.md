# Contributing to Multi-Sport Australia Tracker

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Git

### Initial Setup
```bash
# Clone repository
git clone <repo-url>
cd multi-sport-aus

# Install dependencies
cd mobile-app && npm install && cd ..
cd backend && npm install && cd ..

# Run tests
./test-setup.sh
```

## Project Structure

```
multi-sport-aus/
├── mobile-app/          # React Native application
│   ├── src/
│   │   ├── screens/     # Screen components
│   │   ├── services/    # Business logic
│   │   ├── navigation/  # Navigation setup
│   │   └── components/  # Reusable components
│   └── App.js
├── backend/             # Node.js API server
│   └── server.js
└── docs/                # Documentation
```

## Coding Standards

### JavaScript/React Native
- Use ES6+ features
- Follow Airbnb style guide
- Use functional components with hooks
- PropTypes for component props
- Meaningful variable names
- Comments for complex logic

### Example
```javascript
// Good
const fetchSportsEvents = async () => {
  try {
    const events = await sportsApi.getAllSchedules();
    setEvents(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
  }
};

// Bad
const f = async () => {
  const e = await sportsApi.getAllSchedules();
  setEvents(e);
};
```

### Node.js/Express
- Use async/await over callbacks
- Proper error handling
- Input validation
- Security best practices
- Clear API documentation

## Commit Messages

Follow conventional commits:

- `feat: add new feature`
- `fix: bug fix`
- `docs: documentation update`
- `style: code formatting`
- `refactor: code refactoring`
- `test: add tests`
- `chore: maintenance tasks`

### Examples
```
feat: add AFL schedule integration
fix: resolve notification scheduling bug
docs: update deployment instructions
```

## Testing

### Mobile App
```bash
cd mobile-app
npm test
```

### Backend
```bash
cd backend
npm test
```

### Manual Testing
- Test on both iOS and Android
- Test with/without internet
- Test notification permissions
- Test email reminders

## Pull Request Process

1. **Update Documentation**: Update README if needed
2. **Test Your Changes**: Ensure all tests pass
3. **Follow Style Guide**: Run linter if available
4. **Write Clear Description**: Explain what and why
5. **Link Issues**: Reference related issues
6. **Request Review**: Tag maintainers

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Backend tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
```

## Feature Requests

When requesting a feature:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Propose a solution** if you have one
4. **Consider alternatives** and tradeoffs
5. **Add examples** or mockups if helpful

## Bug Reports

When reporting a bug:

1. **Search existing issues** first
2. **Use bug report template**:
   ```markdown
   **Description**
   Clear description of the bug
   
   **Steps to Reproduce**
   1. Step one
   2. Step two
   
   **Expected Behavior**
   What should happen
   
   **Actual Behavior**
   What actually happens
   
   **Environment**
   - OS: [e.g., iOS 17, Android 14]
   - App version: [e.g., 1.0.0]
   - Device: [e.g., iPhone 15, Pixel 7]
   
   **Screenshots**
   If applicable
   
   **Additional Context**
   Any other relevant information
   ```

## Adding New Sports

To add a new sport:

1. **Update `sportsApi.js`**:
```javascript
async getNewSportSchedule() {
  try {
    // Fetch from API or use mock data
    return mockData;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}
```

2. **Update `getAllSchedules()`**:
```javascript
async getAllSchedules() {
  const [f1, bathurst, nrl, afl, newSport] = await Promise.all([
    this.getF1Schedule(),
    this.getBathurstSchedule(),
    this.getNRLSchedule(),
    this.getAFLSchedule(),
    this.getNewSportSchedule(), // Add here
  ]);
  
  return [...f1, ...bathurst, ...nrl, ...afl, ...newSport].sort(...);
}
```

3. **Update filters in `HomeScreen.js`**:
```javascript
const sports = ['All', 'F1', 'Bathurst', 'NRL', 'AFL', 'NewSport'];
```

4. **Update color scheme in `CalendarScreen.js`**:
```javascript
const colors = {
  F1: '#E10600',
  Bathurst: '#FFB612',
  NRL: '#0066CC',
  AFL: '#FF0000',
  NewSport: '#00FF00', // Add color
};
```

5. **Test thoroughly**

## Integrating Real APIs

When replacing mock data with real APIs:

1. **Research the API**
   - Documentation
   - Rate limits
   - Authentication
   - Terms of service

2. **Create API client**
   ```javascript
   const API_KEY = 'your-key';
   const API_URL = 'https://api.example.com';
   
   async function fetchData() {
     const response = await axios.get(`${API_URL}/endpoint`, {
       headers: { 'Authorization': `Bearer ${API_KEY}` }
     });
     return response.data;
   }
   ```

3. **Transform data** to match expected format
4. **Handle errors** gracefully
5. **Add fallback** to mock data
6. **Update documentation**

## Code Review Guidelines

When reviewing code:

- Be constructive and respectful
- Focus on the code, not the person
- Explain your reasoning
- Suggest alternatives
- Approve when satisfied

When receiving reviews:

- Be open to feedback
- Ask questions if unclear
- Make requested changes
- Thank reviewers

## Security

### Reporting Security Issues

**DO NOT** open a public issue for security vulnerabilities.

Instead:
1. Email maintainers privately
2. Describe the vulnerability
3. Wait for response before disclosure

### Security Best Practices

- Never commit secrets (API keys, passwords)
- Use environment variables
- Validate all inputs
- Keep dependencies updated
- Follow OWASP guidelines

## Documentation

Good documentation helps everyone:

- Keep README up to date
- Document new features
- Add JSDoc comments
- Update API documentation
- Include examples

## Community

- Be respectful and inclusive
- Help others
- Share knowledge
- Give credit
- Have fun!

## Questions?

- Open an issue for general questions
- Check existing documentation
- Search closed issues
- Join discussions

## License

By contributing, you agree that your contributions will be licensed under the project's ISC License.

---

Thank you for contributing! 🎉
