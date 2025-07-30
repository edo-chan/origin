import type { Meta, StoryObj } from '@storybook/nextjs';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { useTheme } from '../styles/ThemeContext';

const meta: Meta = {
  title: '🎨 Style Chooser',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const ThemeShowcase = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Design System Theme Chooser</h1>
      
      {/* Theme Selector */}
      <Card variant="tertiary" size="lg" style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>Current Theme: {currentTheme}</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {availableThemes.map((theme) => (
            <Button
              key={theme}
              variant={theme === currentTheme ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => setTheme(theme)}
              style={{ textTransform: 'capitalize' }}
            >
              {theme}
            </Button>
          ))}
        </div>
      </Card>
      
      {/* Component Showcase */}
      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        
        {/* Buttons */}
        <Card variant="primary" size="md">
          <h3 style={{ marginBottom: '16px' }}>Buttons</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="primary" size="sm">Primary</Button>
              <Button variant="secondary" size="sm">Secondary</Button>
              <Button variant="tertiary" size="sm">Tertiary</Button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="primary" size="xs">XS</Button>
              <Button variant="primary" size="sm">SM</Button>
              <Button variant="primary" size="md">MD</Button>
              <Button variant="primary" size="lg">LG</Button>
            </div>
          </div>
        </Card>
        
        {/* Inputs */}
        <Card variant="secondary" size="md">
          <h3 style={{ marginBottom: '16px' }}>Inputs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Input variant="primary" placeholder="Primary input" />
            <Input variant="secondary" placeholder="Secondary input" />
            <Input variant="tertiary" placeholder="Tertiary input" />
          </div>
        </Card>
        
        {/* Cards */}
        <Card variant="tertiary" size="md">
          <h3 style={{ marginBottom: '16px' }}>Cards</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Card variant="primary" size="xs">Primary XS Card</Card>
            <Card variant="secondary" size="sm">Secondary SM Card</Card>
            <Card variant="tertiary" size="md">Tertiary MD Card</Card>
          </div>
        </Card>
        
      </div>
      
      {/* Color Palette Preview */}
      <Card variant="tertiary" size="lg" style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Color Palette</h3>
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {['primary', 'secondary', 'tertiary'].map(palette => (
            <div key={palette}>
              <h4 style={{ marginBottom: '8px', textTransform: 'capitalize' }}>{palette}</h4>
              <div style={{ display: 'flex', height: '40px', borderRadius: '8px', overflow: 'hidden' }}>
                {[100, 300, 500, 700, 900].map(shade => (
                  <div
                    key={shade}
                    style={{
                      flex: 1,
                      backgroundColor: `var(--color-${palette}-${shade})`,
                    }}
                    title={`${palette}-${shade}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export const ThemeChooser: Story = {
  render: () => <ThemeShowcase />,
};