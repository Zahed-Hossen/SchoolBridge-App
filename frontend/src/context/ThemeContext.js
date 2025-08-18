// import React, { createContext, useState, useMemo } from 'react';
// import { TEACHER_THEME, COLORS } from '../constants/theme';

// export const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [isDark, setIsDark] = useState(false);

//   const toggleTheme = () => setIsDark(!isDark);

//   const theme = useMemo(() => {
//     const baseTheme = TEACHER_THEME;

//     return {
//       ...baseTheme,
//       dark: isDark,
//       colors: {
//         ...baseTheme.colors,
//         // Override colors for dark mode
//         ...(isDark
//           ? {
//               background: {
//                 primary: '#121212',
//                 secondary: '#1E1E1E',
//                 accent: '#2A2A2A',
//               },
//               text: {
//                 primary: '#FFFFFF',
//                 secondary: '#BBBBBB',
//                 muted: '#888888',
//               },
//               border: '#333333',
//             }
//           : {}),
//       },
//       toggleTheme,
//     };
//   }, [isDark]);

//   return (
//     <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
//   );
// };

// export const useTheme = () => {
//   const context = React.useContext(ThemeContext);
//   if (!context) {
//     throw new Error('useTheme must be used within a ThemeProvider');
//   }
//   return context;
// };
