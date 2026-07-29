import HeroSection from "../components/home/HeroSection";
import HowItWorks from "../components/home/HowItWorks";
import Categories from "../components/home/Categories";
import Features from "../components/home/Features";
import RecentListings from "../components/home/RecentListings";
import CallToAction from "../components/home/CallToAction";

export default function Home(){

    return(

        <>
            <HeroSection/>
            <HowItWorks />
            <Categories />
            <Features />
            <RecentListings />
            <CallToAction />
        </>

    );

}