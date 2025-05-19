import { createGlobalStyle } from 'styled-components';
import { THEME } from '../constants';

export const GlobalStyles = createGlobalStyle`
  :root {
    --primary-color: ${THEME.COLORS.PRIMARY};
    --primary-color-dark: ${THEME.COLORS.PRIMARY_DARK};
    --primary-color-light: ${THEME.COLORS.PRIMARY_LIGHT};
    --secondary-color: ${THEME.COLORS.SECONDARY};
    --secondary-color-dark: ${THEME.COLORS.SECONDARY_DARK};
    --text-color: ${THEME.COLORS.TEXT};
    --text-color-light: ${THEME.COLORS.TEXT_LIGHT};
    --background-color: ${THEME.COLORS.BACKGROUND};
    --error-color: ${THEME.COLORS.ERROR};
    --success-color: ${THEME.COLORS.SUCCESS};
    --warning-color: ${THEME.COLORS.WARNING};
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.5;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  /* Анимации */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }

  .slide-in {
    animation: slideIn 0.3s ease-in-out;
  }
`; 