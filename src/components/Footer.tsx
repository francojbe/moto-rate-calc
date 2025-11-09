export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-transparent py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {currentYear} MotoRate Calc. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};