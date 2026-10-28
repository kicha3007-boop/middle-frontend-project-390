interface LoaderProps {
  text: string;
}

// Индикатор загрузки; <output> озвучивается скринридерами как статус.
export const Loader = ({ text }: LoaderProps) => <output className="muted loader">{text}</output>;
