import type { Meta, StoryObj } from '@storybook/react';
import { Button, ButtonGroup, Card, ChatBubble, Dropdown, Input, Text, Tag, Chip, ColorPalette, Loading, Slider, Switch, Tooltip, Table, Stack } from '../components';
import { useTheme } from '@/ui/styles/ThemeContext';

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
      <h1 style={{ marginBottom: '24px' }}>Studio Ghibli Design System</h1>
      
      {/* Theme Selector */}
      <Card variant="tertiary" size="lg" style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>Current Theme: {currentTheme}</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {availableThemes.map((theme) => (
            <Button
              key={theme}
              variant={theme === currentTheme ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => setTheme(theme)}
              style={{ textTransform: 'capitalize' }}
            >
              {theme === 'light' ? '☀️ Light' : 
               theme === 'dark' ? '🌙 Dark' : 
               theme === 'cyberpunk' ? '⚡ Cyberpunk' :
               theme === 'japanese90s' ? '🌸 90s Japanese' :
               theme === 'disney' ? '🏰 Disney' :
               theme === 'neobrutal' ? '🔲 Neo-Brutal' :
               theme === 'kdrama' ? '💕 K-drama' :
               theme === 'slate-monochrome' ? '⚫ Slate Monochrome' :
               '🎩 Almost-Hermes'}
            </Button>
          ))}
        </div>
        <p style={{ margin: 0, color: 'var(--color-textSecondary)' }}>
          {currentTheme === 'light' 
            ? 'Warm, organic colors inspired by sunny Ghibli meadows and golden hour scenes.'
            : currentTheme === 'dark'
            ? 'Mystical colors inspired by moonlit forests and magical night scenes in Ghibli films.'
            : currentTheme === 'cyberpunk'
            ? 'Electric neon colors inspired by futuristic cityscapes and digital interfaces.'
            : currentTheme === 'japanese90s'
            ? 'Nostalgic colors inspired by vintage Japanese design, anime aesthetics, and cherry blossoms.'
            : currentTheme === 'disney'
            ? 'Magical colors inspired by fairy tales, enchanted kingdoms, and whimsical adventures.'
            : currentTheme === 'neobrutal'
            ? 'Bold, uncompromising colors inspired by brutalist architecture and raw concrete.'
            : currentTheme === 'kdrama'
            ? 'Soft, romantic colors inspired by Korean dramas, Seoul aesthetics, and dreamy romance.'
            : currentTheme === 'slate-monochrome'
            ? 'Professional monochrome palette inspired by minimalist design and corporate aesthetics.'
            : 'Sophisticated colors inspired by luxury fashion, high-end design, and timeless elegance.'
          }
        </p>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Input variant="primary" label="Primary Input" placeholder="Enter text..." />
              <Input variant="secondary" label="Secondary Input" placeholder="Enter text..." />
              <Input variant="tertiary" label="Tertiary Input" placeholder="Enter text..." />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Text variant="secondary" size="sm" weight="medium">Error States</Text>
              <Input 
                label="Required Field" 
                placeholder="This field is required" 
                error={true} 
                errorMessage="This field is required" 
              />
              <Input 
                label="Email Address" 
                placeholder="Enter your email" 
                error={true} 
                errorMessage="Please enter a valid email address" 
                defaultValue="invalid-email"
              />
              <Input 
                label="Password" 
                type="password"
                placeholder="Enter password" 
                error={true} 
                errorMessage="Password must be at least 8 characters" 
                defaultValue="123"
              />
            </div>
          </div>
        </Card>
        
        {/* Dropdowns */}
        <Card variant="primary" size="md">
          <Text as="h3" size="lg" weight="semibold" style={{ marginBottom: '16px' }}>Dropdowns</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Text variant="secondary" size="sm" weight="medium" style={{ marginBottom: '8px' }}>
                Basic Dropdowns
              </Text>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Dropdown
                  variant="primary"
                  trigger="Select Option ▼"
                  options={[
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' },
                    { value: 'option3', label: 'Option 3', separator: true },
                    { value: 'option4', label: 'Disabled Option', disabled: true },
                  ]}
                  onSelect={(value) => console.log('Selected:', value)}
                />
                <Dropdown
                  variant="secondary"
                  trigger="Categories ▼"
                  options={[
                    { value: 'electronics', label: 'Electronics' },
                    { value: 'clothing', label: 'Clothing' },
                    { value: 'home', label: 'Home & Garden' },
                    { value: 'books', label: 'Books', separator: true },
                    { value: 'other', label: 'Other' },
                  ]}
                  onSelect={(value) => console.log('Selected:', value)}
                />
                <Dropdown
                  variant="tertiary"
                  trigger="More Actions ▼"
                  options={[
                    { value: 'edit', label: '✏️ Edit' },
                    { value: 'copy', label: '📋 Copy' },
                    { value: 'share', label: '🔗 Share', separator: true },
                    { value: 'delete', label: '🗑️ Delete' },
                  ]}
                  onSelect={(value) => console.log('Selected:', value)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Text variant="secondary" size="sm" weight="medium" style={{ marginBottom: '8px' }}>
                Size Variants
              </Text>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Dropdown
                  size="sm"
                  trigger="Small ▼"
                  options={[
                    { value: 'sm1', label: 'Small Option 1' },
                    { value: 'sm2', label: 'Small Option 2' },
                  ]}
                  onSelect={(value) => console.log('Selected:', value)}
                />
                <Dropdown
                  size="md"
                  trigger="Medium ▼"
                  options={[
                    { value: 'md1', label: 'Medium Option 1' },
                    { value: 'md2', label: 'Medium Option 2' },
                  ]}
                  onSelect={(value) => console.log('Selected:', value)}
                />
                <Dropdown
                  size="lg"
                  trigger="Large ▼"
                  options={[
                    { value: 'lg1', label: 'Large Option 1' },
                    { value: 'lg2', label: 'Large Option 2' },
                  ]}
                  onSelect={(value) => console.log('Selected:', value)}
                />
              </div>
            </div>
          </div>
        </Card>
        
        {/* Text */}
        <Card variant="tertiary" size="md">
          <Text as="h3" size="lg" weight="semibold" style={{ marginBottom: '16px' }}>Text</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Text variant="primary" size="xl" weight="bold">Primary Heading</Text>
            <Text variant="secondary" size="base">Secondary text</Text>
            <Text variant="success" size="sm" weight="medium">Success message</Text>
            <Text variant="danger" size="sm" weight="medium">Error message</Text>
          </div>
        </Card>
        
        {/* Tags */}
        <Card variant="primary" size="md">
          <Text as="h3" size="lg" weight="semibold" style={{ marginBottom: '16px' }}>Tags</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Tag variant="primary" size="sm">Primary</Tag>
              <Tag variant="secondary" size="sm">Secondary</Tag>
              <Tag variant="tertiary" size="sm">Tertiary</Tag>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Tag variant="success" size="sm">Success</Tag>
              <Tag variant="warning" size="sm">Warning</Tag>
              <Tag variant="danger" size="sm">Danger</Tag>
            </div>
          </div>
        </Card>
        
        {/* Chips */}
        <Card variant="secondary" size="md">
          <Text as="h3" size="lg" weight="semibold" style={{ marginBottom: '16px' }}>Chips</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Chip variant="primary" size="sm">Primary</Chip>
              <Chip variant="secondary" size="sm">Secondary</Chip>
              <Chip variant="tertiary" size="sm">Tertiary</Chip>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Chip variant="success" size="sm">Success</Chip>
              <Chip variant="warning" size="sm">Warning</Chip>
              <Chip variant="danger" size="sm">Danger</Chip>
            </div>
          </div>
        </Card>
        
        {/* Cards */}
        <Card variant="tertiary" size="md">
          <Text as="h3" size="lg" weight="semibold" style={{ marginBottom: '16px' }}>Cards</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Card variant="primary" size="sm">
              <Text variant="primary" size="sm" weight="medium">Primary Card</Text>
              <Text variant="secondary" size="xs" style={{ marginTop: '4px' }}>
                With primary border styling
              </Text>
            </Card>
            <Card variant="secondary" size="sm">
              <Text variant="primary" size="sm" weight="medium">Secondary Card</Text>
              <Text variant="secondary" size="xs" style={{ marginTop: '4px' }}>
                With secondary border styling
              </Text>
            </Card>
            <Card variant="tertiary" size="sm">
              <Text variant="primary" size="sm" weight="medium">Tertiary Card</Text>
              <Text variant="secondary" size="xs" style={{ marginTop: '4px' }}>
                With subtle tertiary styling
              </Text>
            </Card>
          </div>
        </Card>
        
        {/* Loading States */}
        <Card variant="primary" size="md">
          <Text as="h3" size="lg" weight="semibold" style={{ marginBottom: '16px' }}>Loading States</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Spinners */}
            <div>
              <Text variant="secondary" size="sm" weight="medium" style={{ marginBottom: '8px' }}>
                Spinners
              </Text>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <Loading type="spinner" variant="primary" size="sm" />
                  <Text size="xs" variant="secondary">Primary</Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <Loading type="spinner" variant="secondary" size="md" />
                  <Text size="xs" variant="secondary">Secondary</Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <Loading type="spinner" variant="tertiary" size="lg" />
                  <Text size="xs" variant="secondary">Tertiary</Text>
                </div>
              </div>
            </div>
            
            {/* Progress Bars */}
            <div>
              <Text variant="secondary" size="sm" weight="medium" style={{ marginBottom: '8px' }}>
                Progress Bars
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <Text size="xs" variant="secondary" style={{ marginBottom: '4px' }}>Primary - 25%</Text>
                  <Loading type="progress" variant="primary" progress={25} />
                </div>
                <div>
                  <Text size="xs" variant="secondary" style={{ marginBottom: '4px' }}>Secondary - 60%</Text>
                  <Loading type="progress" variant="secondary" progress={60} />
                </div>
                <div>
                  <Text size="xs" variant="secondary" style={{ marginBottom: '4px' }}>Tertiary - 85%</Text>
                  <Loading type="progress" variant="tertiary" progress={85} />
                </div>
              </div>
            </div>
            
            {/* Animated Dots */}
            <div>
              <Text variant="secondary" size="sm" weight="medium" style={{ marginBottom: '8px' }}>
                Animated Dots
              </Text>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <Loading type="dots" variant="primary" size="sm" />
                  <Text size="xs" variant="secondary">Primary</Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <Loading type="dots" variant="secondary" size="md" />
                  <Text size="xs" variant="secondary">Secondary</Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <Loading type="dots" variant="tertiary" size="lg" />
                  <Text size="xs" variant="secondary">Tertiary</Text>
                </div>
              </div>
            </div>
            
          </div>
        </Card>
        
        {/* Form Controls */}
        <Card variant="secondary" size="md">
          <Text as="h3" size="lg" weight="semibold" style={{ marginBottom: '16px' }}>Form Controls</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Switches */}
            <div>
              <Text variant="secondary" size="sm" weight="medium" style={{ marginBottom: '8px' }}>
                Switches
              </Text>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Switch variant="primary" size="sm" label="Primary SM" />
                <Switch variant="secondary" size="md" label="Secondary MD" />
                <Switch variant="tertiary" size="lg" label="Tertiary LG" />
              </div>
            </div>
            
            {/* Sliders */}
            <div>
              <Text variant="secondary" size="sm" weight="medium" style={{ marginBottom: '8px' }}>
                Sliders
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Slider variant="primary" value={[25]} label="Primary Slider" showValue />
                <Slider variant="secondary" value={[60]} label="Secondary Slider" showValue />
                <Slider variant="tertiary" value={[85]} label="Tertiary Slider" showValue />
              </div>
            </div>
            
          </div>
        </Card>
        
        {/* Interactive Elements */}
        <Card variant="tertiary" size="md">
          <Text as="h3" size="lg" weight="semibold" style={{ marginBottom: '16px' }}>Interactive Elements</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Button Groups */}
            <div>
              <Text variant="secondary" size="sm" weight="medium" style={{ marginBottom: '8px' }}>
                Button Groups
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <ButtonGroup size="sm">
                  <Button variant="primary">Left</Button>
                  <Button variant="primary">Center</Button>
                  <Button variant="primary">Right</Button>
                </ButtonGroup>
                <ButtonGroup orientation="vertical">
                  <Button variant="secondary">Top</Button>
                  <Button variant="secondary">Middle</Button>
                  <Button variant="secondary">Bottom</Button>
                </ButtonGroup>
              </div>
            </div>
            
            {/* Tooltips */}
            <div>
              <Text variant="secondary" size="sm" weight="medium" style={{ marginBottom: '8px' }}>
                Tooltips
              </Text>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Tooltip content="Primary tooltip" variant="primary">
                  <Button variant="primary" size="sm">Hover me</Button>
                </Tooltip>
                <Tooltip content="Secondary tooltip" variant="secondary" side="bottom">
                  <Button variant="secondary" size="sm">Bottom tooltip</Button>
                </Tooltip>
                <Tooltip content="Tertiary tooltip" variant="tertiary" side="right">
                  <Button variant="tertiary" size="sm">Right tooltip</Button>
                </Tooltip>
              </div>
            </div>
            
          </div>
        </Card>
        
        {/* Layout Components */}
        <Card variant="primary" size="md">
          <Text as="h3" size="lg" weight="semibold" style={{ marginBottom: '16px' }}>Layout Components</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Stack Layouts */}
            <div>
              <Text variant="secondary" size="sm" weight="medium" style={{ marginBottom: '8px' }}>
                Stack Layouts
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Vertical Stack */}
                <div>
                  <Text size="xs" variant="secondary" style={{ marginBottom: '4px' }}>Vertical Stack (gap: md)</Text>
                  <Card variant="tertiary" size="sm" style={{ padding: '12px' }}>
                    <Stack direction="column" gap="md" align="flex-start">
                      <Tag variant="primary" size="sm">Item 1</Tag>
                      <Tag variant="secondary" size="sm">Item 2</Tag>
                      <Tag variant="tertiary" size="sm">Item 3</Tag>
                    </Stack>
                  </Card>
                </div>
                
                {/* Horizontal Stack */}
                <div>
                  <Text size="xs" variant="secondary" style={{ marginBottom: '4px' }}>Horizontal Stack (gap: sm, justify: space-between)</Text>
                  <Card variant="tertiary" size="sm" style={{ padding: '12px' }}>
                    <Stack direction="row" gap="sm" justify="space-between" align="center">
                      <Chip variant="primary" size="sm">Left</Chip>
                      <Chip variant="secondary" size="sm">Center</Chip>
                      <Chip variant="tertiary" size="sm">Right</Chip>
                    </Stack>
                  </Card>
                </div>
                
                {/* Wrapped Stack */}
                <div>
                  <Text size="xs" variant="secondary" style={{ marginBottom: '4px' }}>Wrapped Stack (direction: row, wrap: true, gap: xs)</Text>
                  <Card variant="tertiary" size="sm" style={{ padding: '12px' }}>
                    <Stack direction="row" gap="xs" wrap={true} align="center">
                      <Tag variant="primary" size="sm">Tag 1</Tag>
                      <Tag variant="secondary" size="sm">Tag 2</Tag>
                      <Tag variant="tertiary" size="sm">Tag 3</Tag>
                      <Tag variant="success" size="sm">Tag 4</Tag>
                      <Tag variant="warning" size="sm">Tag 5</Tag>
                      <Tag variant="danger" size="sm">Tag 6</Tag>
                    </Stack>
                  </Card>
                </div>
                
                {/* Padded Stack */}
                <div>
                  <Text size="xs" variant="secondary" style={{ marginBottom: '4px' }}>Padded Stack (padding: md, gap: sm)</Text>
                  <Card variant="secondary" size="sm">
                    <Stack direction="column" gap="sm" padding="md" align="center">
                      <Text variant="primary" weight="semibold">Centered Content</Text>
                      <Text variant="secondary" size="sm">With consistent padding and gaps</Text>
                      <Button variant="primary" size="sm">Action Button</Button>
                    </Stack>
                  </Card>
                </div>
                
              </div>
            </div>
            
          </div>
        </Card>
        
        {/* Communication */}
        <Card variant="secondary" size="md">
          <Text as="h3" size="lg" weight="semibold" style={{ marginBottom: '16px' }}>Communication</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Chat Bubbles */}
            <div>
              <Text variant="secondary" size="sm" weight="medium" style={{ marginBottom: '8px' }}>
                Chat Bubbles
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px' }}>
                <ChatBubble 
                  position="left" 
                  variant="neutral" 
                  avatar={<div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />}
                  timestamp="2:30 PM"
                >
                  Hello! How are you doing today?
                </ChatBubble>
                <ChatBubble 
                  position="right" 
                  variant="primary"
                  avatar={<div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)' }} />}
                  timestamp="2:31 PM"
                >
                  I&apos;m doing great, thanks for asking!
                </ChatBubble>
                <ChatBubble 
                  position="left" 
                  variant="tertiary" 
                  size="sm"
                  showTail={false}
                >
                  This bubble has no tail
                </ChatBubble>
              </div>
            </div>
            
            {/* Table */}
            <div>
              <Text variant="secondary" size="sm" weight="medium" style={{ marginBottom: '8px' }}>
                Data Table
              </Text>
              <Table
                variant="primary"
                size="sm"
                columns={[
                  { key: 'name', header: 'Name' },
                  { key: 'role', header: 'Role' },
                  { key: 'status', header: 'Status' }
                ]}
                data={[
                  { name: 'Alice Johnson', role: 'Designer', status: 'Active' },
                  { name: 'Bob Smith', role: 'Developer', status: 'Away' },
                  { name: 'Carol Davis', role: 'Manager', status: 'Active' }
                ]}
              />
            </div>
            
          </div>
        </Card>
        
      </div>
      
      {/* Card Sizes Showcase */}
      <Card variant="primary" size="lg" style={{ marginTop: '24px' }}>
        <Text as="h3" size="lg" weight="semibold" style={{ marginBottom: '16px' }}>Card Sizes</Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Card variant="tertiary" size="xs">
              <Text size="xs" weight="medium">XS Card</Text>
            </Card>
            <Card variant="tertiary" size="sm">
              <Text size="sm" weight="medium">SM Card</Text>
            </Card>
            <Card variant="tertiary" size="md">
              <Text size="base" weight="medium">MD Card</Text>
            </Card>
            <Card variant="tertiary" size="lg">
              <Text size="lg" weight="medium">LG Card</Text>
            </Card>
            <Card variant="tertiary" size="xl">
              <Text size="xl" weight="medium">XL Card</Text>
            </Card>
          </div>
        </div>
      </Card>

      {/* Color Palette Preview */}
      <Card variant="tertiary" size="lg" style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Current Theme Color Palette</h3>
        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <ColorPalette palette="primary" />
          <ColorPalette palette="secondary" />
          <ColorPalette palette="tertiary" />
          <ColorPalette palette="neutral" />
        </div>
      </Card>
    </div>
  );
};

export const ThemeChooser: Story = {
  render: () => <ThemeShowcase />,
};