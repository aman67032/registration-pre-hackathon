import React from 'react';

const Loader = () => {
    return (
        <div className="loader-container">
            <div className="spinner">
                <div />
                <div />
                <div />
                <div />
                <div />
                <div />
            </div>
            <style jsx>{`
        .loader-container {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #121519; /* Solid dark background */
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner {
          width: 100px;
          height: 100px;
          animation: spinner-y0fdc1 2s infinite ease;
          transform-style: preserve-3d;
        }

        .spinner > div {
          background-color: rgba(207, 157, 123, 0.2);
          height: 100%;
          position: absolute;
          width: 100%;
          border: 2px solid #E8C39E;
          box-shadow: 0 0 10px rgba(232, 195, 158, 0.2);
        }

        .spinner div:nth-of-type(1) {
          transform: translateZ(-50px) rotateY(180deg);
        }

        .spinner div:nth-of-type(2) {
          transform: rotateY(-270deg) translateX(50%);
          transform-origin: top right;
        }

        .spinner div:nth-of-type(3) {
          transform: rotateY(270deg) translateX(-50%);
          transform-origin: center left;
        }

        .spinner div:nth-of-type(4) {
          transform: rotateX(90deg) translateY(-50%);
          transform-origin: top center;
        }

        .spinner div:nth-of-type(5) {
          transform: rotateX(-90deg) translateY(50%);
          transform-origin: bottom center;
        }

        .spinner div:nth-of-type(6) {
          transform: translateZ(50px);
        }

        @keyframes spinner-y0fdc1 {
          0% {
            transform: rotate(45deg) rotateX(-25deg) rotateY(25deg);
          }

          50% {
            transform: rotate(45deg) rotateX(-385deg) rotateY(25deg);
          }

          100% {
            transform: rotate(45deg) rotateX(-385deg) rotateY(385deg);
          }
        }
      `}</style>
        </div>
    );
}

export default Loader;
