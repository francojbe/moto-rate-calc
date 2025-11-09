export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary text-primary-foreground py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          © {currentYear} MotoRate Calc. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};