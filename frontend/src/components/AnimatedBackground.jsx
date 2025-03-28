import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const AnimatedBackground = styled.div`
    position: fixed;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    background: linear-gradient(-45deg, #171718, #171718, #171718, #1a2f2a);
    background-size: 400% 400%;
    animation: ${gradientFlow} 40s ease infinite;

    &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(80px);
    }
`;

export default AnimatedBackground;