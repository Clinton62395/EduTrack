// components/PaginationDots.jsx
import { Box } from "@/components/ui/theme";

export function PaginationDots({ data, currentIndex }) {
  return (
    <Box flexDirection="row" gap="xs" alignItems="center">
      {data.map((_, index) => (
        <Box
          key={index}
          width={currentIndex === index ? 24 : 8}
          height={8}
          borderRadius='xs'
          backgroundColor={currentIndex === index ? "primary" : "border"}
        />
      ))}
    </Box>
  );
}
