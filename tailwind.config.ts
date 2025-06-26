import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				'lime-green': {
					'50': '#feffeb',
					'100': '#fdfecc',
					'200': '#fcfe9c',
					'300': '#fafd61',
					'400': '#f8fb31',
					'500': '#dffe2c',
					'600': '#c2d814',
					'700': '#94a212',
					'800': '#757f16',
					'900': '#636a18'
				},
				'sage-blue': {
					'50': '#f4f8fa',
					'100': '#e7f0f4',
					'200': '#d4e4eb',
					'300': '#b8d0db',
					'400': '#a6c7d5',
					'500': '#8db4c5',
					'600': '#7aa0b4',
					'700': '#6c8da1',
					'800': '#5c7485',
					'900': '#4e606b'
				},
				'mint-background': {
					'50': '#f6f9f6',
					'100': '#ebf4eb',
					'200': '#d8e8d8',
					'300': '#b8d4b8',
					'400': '#93bc93',
					'500': '#739f73',
					'600': '#5a825a',
					'700': '#496849',
					'800': '#3c543c',
					'900': '#334533'
				},
				'vivid-sky-blue': {
					'50': '#f0fcff',
					'100': '#e0f8ff',
					'200': '#baf2ff',
					'300': '#7ce9ff',
					'400': '#36ddff',
					'500': '#23c9ff',
					'600': '#05a8f3',
					'700': '#0890e0',
					'800': '#0f74b6',
					'900': '#135f95'
				},
				'maya-blue': {
					'50': '#f0fbff',
					'100': '#e0f5ff',
					'200': '#b8edff',
					'300': '#7cc6fe',
					'400': '#369cfa',
					'500': '#0c7be8',
					'600': '#0062c7',
					'700': '#014ea1',
					'800': '#064485',
					'900': '#0b396e'
				},
				'periwinkle': {
					'50': '#f4f6ff',
					'100': '#ecefff',
					'200': '#dde3ff',
					'300': '#ccd5ff',
					'400': '#a5b4ff',
					'500': '#8b96ff',
					'600': '#7168ff',
					'700': '#6054eb',
					'800': '#4e44c4',
					'900': '#423c9c'
				},
				'pink-lavender': {
					'50': '#fdf5fd',
					'100': '#faeafa',
					'200': '#f4d5f5',
					'300': '#e7bbe3',
					'400': '#d591cc',
					'500': '#c470b2',
					'600': '#ad5595',
					'700': '#92467a',
					'800': '#783c65',
					'900': '#643456'
				},
				'puce': {
					'50': '#fdf4f7',
					'100': '#fce8f1',
					'200': '#f9d3e4',
					'300': '#f4b1ce',
					'400': '#ec84ac',
					'500': '#c884a6',
					'600': '#d7658c',
					'700': '#bf4b73',
					'800': '#a03f60',
					'900': '#863752'
				},
				'iced-coffee': {
					'50': '#faf8f6',
					'100': '#f3ede4',
					'200': '#e6d7c7',
					'300': '#d4bca1',
					'400': '#c09d7a',
					'500': '#b1855e',
					'600': '#a47452',
					'700': '#885f45',
					'800': '#6f4e3c',
					'900': '#5a4132'
				},
				'iced-matcha': {
					'50': '#f6fbf4',
					'100': '#e9f6e3',
					'200': '#d4ecc8',
					'300': '#b4dc9e',
					'400': '#8cc66d',
					'500': '#6aad47',
					'600': '#528c35',
					'700': '#426e2c',
					'800': '#375827',
					'900': '#2f4a24'
				},
				'mandarin': {
					'50': '#FFF8F3',
					'100': '#FFEEE0',
					'200': '#FFD9C1',
					'300': '#FFC197',
					'400': '#FFA35C',
					'500': '#FF8C3A',
					'600': '#F06B1F',
					'700': '#C74F15',
					'800': '#9E4016',
					'900': '#803615'
				},
				'soft-blue': {
					'50': '#F0F9FF',
					'100': '#E0F2FE',
					'200': '#BAE6FD',
					'300': '#A2D2FF',
					'400': '#60A5FA',
					'500': '#3B82F6',
					'600': '#2563EB',
					'700': '#1D4ED8',
					'800': '#1E40AF',
					'900': '#1E3A8A'
				},
				'dusty-mauve': {
					'50': '#FAF7FA',
					'100': '#F4EEF4',
					'200': '#E9DBE9',
					'300': '#C1A3C5',
					'400': '#B08BB5',
					'500': '#9F73A5',
					'600': '#8B5A91',
					'700': '#73477A',
					'800': '#5C3B62',
					'900': '#4D3151'
				},
				'blush-pink': {
					'50': '#FFFBFC',
					'100': '#FFF5F7',
					'200': '#FFEBEF',
					'300': '#FFD3DA',
					'400': '#FFB3C1',
					'500': '#FF8FA3',
					'600': '#FF6B85',
					'700': '#E85370',
					'800': '#C73E5C',
					'900': '#A8334D'
				},
				'deep-navy': {
					'50': '#F2F7FC',
					'100': '#E2EBF7',
					'200': '#C9DAEF',
					'300': '#A4C1E3',
					'400': '#7BA2D4',
					'500': '#5A84C7',
					'600': '#476BB8',
					'700': '#3F5AA6',
					'800': '#384B88',
					'900': '#1B3A57'
				}
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'brand-gradient': 'linear-gradient(135deg, #dffe2c 0%, #a6c7d5 50%, #f6f9f6 100%)',
				'lime-gradient': 'linear-gradient(135deg, #dffe2c 0%, #fdfecc 25%, #feffeb 50%, #f6f9f6 100%)',
				'sage-gradient': 'linear-gradient(135deg, #f4f8fa 0%, #e7f0f4 25%, #d4e4eb 50%, #a6c7d5 100%)',
				'mint-gradient': 'linear-gradient(135deg, #f6f9f6 0%, #ebf4eb 25%, #d8e8d8 50%, #b8d4b8 100%)',
				'hero-gradient': 'linear-gradient(135deg, #f6f9f6 0%, #feffeb 25%, #f4f8fa 50%, #e7f0f4 100%)',
				'sky-gradient': 'linear-gradient(135deg, #f0fcff 0%, #e0f8ff 25%, #baf2ff 50%, #23c9ff 100%)',
				'periwinkle-gradient': 'linear-gradient(135deg, #f4f6ff 0%, #ecefff 25%, #dde3ff 50%, #ccd5ff 100%)',
				'data-gradient': 'linear-gradient(135deg, #23c9ff 0%, #ccd5ff 50%, #e7bbe3 100%)',
				'mandarin-gradient': 'linear-gradient(135deg, #FFF8F3 0%, #FFEEE0 25%, #FFD9C1 50%, #FFA35C 100%)',
				'soft-blue-gradient': 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 25%, #BAE6FD 50%, #A2D2FF 100%)',
				'mauve-gradient': 'linear-gradient(135deg, #FAF7FA 0%, #F4EEF4 25%, #E9DBE9 50%, #C1A3C5 100%)',
				'professional-gradient': 'linear-gradient(135deg, #1B3A57 0%, #384B88 50%, #5A84C7 100%)',
			},
			fontFamily: {
				'outfit': ['Outfit', 'system-ui', 'sans-serif'],
				'inter': ['Inter', 'system-ui', 'sans-serif'],
				// Keep legacy aliases
				'poppins': ['Outfit', 'system-ui', 'sans-serif'],
			},
			letterSpacing: {
				'brand': '0.025em',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'organic': '1.5rem 2rem 1rem 2.5rem',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'50%': { transform: 'translateY(-20px) rotate(1deg)' }
				},
				'float-delayed': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'50%': { transform: 'translateY(-15px) rotate(-1deg)' }
				},
				'pulse-glow': {
					'0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
					'50%': { opacity: '1', transform: 'scale(1.05)' }
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'float-delayed': 'float-delayed 6s ease-in-out infinite 2s',
				'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
				'fade-in-up': 'fade-in-up 0.6s ease-out',
				'scale-in': 'scale-in 0.4s ease-out'
			},
			backdropBlur: {
				'xs': '2px',
			},
			boxShadow: {
				'soft': '0 4px 20px rgba(0, 0, 0, 0.06)',
				'soft-lg': '0 8px 30px rgba(0, 0, 0, 0.08)',
				'inner-soft': 'inset 0 2px 8px rgba(0, 0, 0, 0.06)',
				'lime-glow': '0 0 20px rgba(223, 254, 44, 0.2)',
				'sage-glow': '0 0 20px rgba(166, 199, 213, 0.2)',
				'mint-glow': '0 0 20px rgba(246, 249, 246, 0.3)',
				'mandarin-glow': '0 0 20px rgba(255, 163, 92, 0.15)',
				'blue-glow': '0 0 20px rgba(162, 210, 255, 0.15)',
				'mauve-glow': '0 0 20px rgba(193, 163, 197, 0.15)',
				'vivid-sky-glow': '0 0 20px rgba(35, 201, 255, 0.15)',
				'maya-blue-glow': '0 0 20px rgba(124, 198, 254, 0.15)',
				'periwinkle-glow': '0 0 20px rgba(204, 213, 255, 0.15)',
				'pink-lavender-glow': '0 0 20px rgba(231, 187, 227, 0.15)',
				'puce-glow': '0 0 20px rgba(200, 132, 166, 0.15)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
