# M-CHAT-R Questionnaire Application

A modern, responsive web application for conducting the Modified Checklist for Autism in Toddlers, Revised (M-CHAT-R) questionnaire. This application provides an intuitive interface for healthcare professionals to administer the autism screening questionnaire.

![M-CHAT-R Application](screenshots/app-preview.png)

## Features

- 📱 **Responsive Design**: Fully responsive interface that works seamlessly on desktop and mobile devices
- 🎯 **Interactive Questionnaire**: Step-by-step question flow with Yes/No responses
- 📊 **Progress Tracking**: Visual progress indicator showing completed questions
- 🔄 **Navigation**: Easy navigation between questions with previous/next functionality
- 📝 **Sub-Questions**: Dynamic sub-questions based on main question responses
- 🎨 **Modern UI**: Clean and professional design with smooth animations
- 📱 **Mobile-First**: Optimized for mobile devices with a collapsible sidebar
- 🌈 **Accessible**: High contrast and clear typography for better accessibility

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **State Management**: Redux
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **Animations**: CSS Transitions
- **Notifications**: React-Toastify

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Anupam4058/M-Chat-RemotiQ.git
cd M-Chat-RemotiQ
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── component/         # Reusable UI components
│   ├── ui/           # Basic UI components
│   └── functions.ts  # Utility functions
├── pages/            # Page components
├── redux/            # Redux store and actions
├── types/            # TypeScript type definitions
├── data/             # Questionnaire data
└── context/          # React context providers
```

## Usage

1. Start the questionnaire by clicking "Begin"
2. Answer each question with Yes/No
3. Complete any sub-questions that appear
4. Navigate between questions using the sidebar or navigation buttons
5. View results on the final page

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- M-CHAT-R/F is a copyrighted tool. For more information, visit [M-CHAT-R/F](https://mchatscreen.com)
- This application is designed to assist healthcare professionals in administering the M-CHAT-R questionnaire
- The questionnaire content and scoring methodology are based on the official M-CHAT-R guidelines

## Contact

Anupam - [@Anupam4058](https://github.com/Anupam4058)

Project Link: [https://github.com/Anupam4058/M-Chat-RemotiQ](https://github.com/Anupam4058/M-Chat-RemotiQ)

## Screenshots

### Desktop View
![Desktop View](screenshots/desktop-view.png)

### Mobile View
![Mobile View](screenshots/mobile-view.png)

### Question Flow
![Question Flow](screenshots/question-flow.png)

## Future Enhancements

- [ ] Add user authentication
- [ ] Implement result history
- [ ] Add export functionality for results
- [ ] Include detailed scoring explanations
- [ ] Add multi-language support
- [ ] Implement offline functionality

## Support

If you find this project helpful, please give it a ⭐️ on GitHub!

---

**Note**: This application is intended for use by healthcare professionals and should be used in accordance with the official M-CHAT-R guidelines and protocols.

