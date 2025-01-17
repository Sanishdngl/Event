import PropTypes from "prop-types";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { ThemeProvider } from '../context/ThemeContext';
import { SidebarProvider } from '../context/SidebarContext';
import { ErrorBoundary } from '../Components/ErrorBoundary'
const Layout = ({ children }) => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SidebarProvider>
          <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <NavBar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;