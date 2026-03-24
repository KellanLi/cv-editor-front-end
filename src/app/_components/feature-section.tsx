import { Card } from '@heroui/react';

const features = [
  {
    title: 'AI生成简历',
    description: '通过对话自动生成高质量简历内容',
  },
  {
    title: '智能优化',
    description: 'AI帮你优化内容，提高通过率',
  },
  {
    title: '模块自定义',
    description: '高自由度定义模块内容',
  },
];

export default function FeatureSection() {
  return (
    <section className="grid gap-4 bg-gray-50 px-4 py-6 sm:grid-cols-1 md:grid-cols-3">
      {features.map((feature) => (
        <Card
          key={feature.title}
          className="cursor-pointer p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          <Card.Title>{feature.title}</Card.Title>
          <Card.Description>{feature.description}</Card.Description>
        </Card>
      ))}
    </section>
  );
}
