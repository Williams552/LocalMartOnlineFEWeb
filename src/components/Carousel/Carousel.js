import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import carousel1 from "../../assets/image/carousel1.jpg";
import carousel2 from "../../assets/image/carousel2.jpg";
import carousel3 from "../../assets/image/carousel3.jpg";

const HomeCarousel = () => {
    return (
        <div className="carousel-wrapper mt-4 max-w-6xl mx-auto rounded-lg overflow-hidden">
            <Carousel
                autoPlay
                infiniteLoop
                showThumbs={false}
                showStatus={false}
                interval={4000}
                transitionTime={800}
                swipeable
                emulateTouch
            >
                <div>
                    <img
                        src={carousel1}
                        alt="Slide 1"
                        className="h-[350px] w-full object-cover object-center"
                        loading="eager"
                        style={{
                            imageRendering: 'high-quality',
                            imageResolution: 'from-image'
                        }}
                    />
                </div>
                <div>
                    <img
                        src={carousel2}
                        alt="Slide 2"
                        className="h-[350px] w-full object-cover object-center"
                        loading="eager"
                        style={{
                            imageRendering: 'high-quality',
                            imageResolution: 'from-image'
                        }}
                    />
                </div>
                <div>
                    <img
                        src={carousel3}
                        alt="Slide 3"
                        className="h-[350px] w-full object-cover object-center"
                        loading="eager"
                        style={{
                            imageRendering: 'high-quality',
                            imageResolution: 'from-image'
                        }}
                    />
                </div>
            </Carousel>
        </div>

    );
};

export default HomeCarousel;
