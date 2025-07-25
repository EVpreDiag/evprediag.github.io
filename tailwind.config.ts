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
			fontFamily: {
				'orbitron': ['Orbitron', 'monospace'],
				'exo': ['Exo 2', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))',
					dark: 'hsl(var(--primary-dark))',
					light: 'hsl(var(--primary-light))'
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
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				'electric-pulse': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '0.8',
						transform: 'scale(1.05)'
					}
				},
				'tech-glow': {
					'0%, 100%': {
						boxShadow: '0 0 20px hsl(var(--primary) / 0.3)'
					},
					'50%': {
						boxShadow: '0 0 40px hsl(var(--primary) / 0.6), 0 0 60px hsl(var(--primary) / 0.3)'
					}
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
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'holographic': {
					'0%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					},
					'100%': {
						backgroundPosition: '0% 50%'
					}
				},
				'glitch': {
					'0%': {
						textShadow: '0.05em 0 0 hsl(var(--primary) / 0.8), -0.05em -0.025em 0 hsl(var(--primary-glow) / 0.8), 0.025em 0.05em 0 hsl(var(--primary-light) / 0.8)'
					},
					'15%': {
						textShadow: '0.05em 0 0 hsl(var(--primary) / 0.8), -0.05em -0.025em 0 hsl(var(--primary-glow) / 0.8), 0.025em 0.05em 0 hsl(var(--primary-light) / 0.8)'
					},
					'16%': {
						textShadow: '-0.05em -0.025em 0 hsl(var(--primary) / 0.8), 0.025em 0.025em 0 hsl(var(--primary-glow) / 0.8), -0.05em -0.05em 0 hsl(var(--primary-light) / 0.8)'
					},
					'49%': {
						textShadow: '-0.05em -0.025em 0 hsl(var(--primary) / 0.8), 0.025em 0.025em 0 hsl(var(--primary-glow) / 0.8), -0.05em -0.05em 0 hsl(var(--primary-light) / 0.8)'
					},
					'50%': {
						textShadow: '0.025em 0.05em 0 hsl(var(--primary) / 0.8), 0.05em 0 0 hsl(var(--primary-glow) / 0.8), 0 -0.05em 0 hsl(var(--primary-light) / 0.8)'
					},
					'99%': {
						textShadow: '0.025em 0.05em 0 hsl(var(--primary) / 0.8), 0.05em 0 0 hsl(var(--primary-glow) / 0.8), 0 -0.05em 0 hsl(var(--primary-light) / 0.8)'
					},
					'100%': {
						textShadow: '0.05em 0 0 hsl(var(--primary) / 0.8), -0.05em -0.025em 0 hsl(var(--primary-glow) / 0.8), 0.025em 0.05em 0 hsl(var(--primary-light) / 0.8)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'electric-pulse': 'electric-pulse 2s ease-in-out infinite',
				'tech-glow': 'tech-glow 3s ease-in-out infinite',
				'fade-in-up': 'fade-in-up 0.6s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'holographic': 'holographic 3s ease-in-out infinite',
				'glitch': 'glitch 2s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
