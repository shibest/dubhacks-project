export default function MyceliumLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src="https://cdn.builder.io/api/v1/image/assets%2F2bd7c4dae71d49ff85d54901afd4e4cb%2F99f9d09367794038bc377557664511fa?format=webp&width=800"
      alt="Mycelius"
      className={`${className} object-contain`}
    />
  );
}
