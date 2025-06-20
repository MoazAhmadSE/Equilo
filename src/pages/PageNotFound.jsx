import FuzzyText from "../components/FuzzyText";
import "../css/pages/PageNotFound.css";

const PageNotFound = () => {
  return (
    <div className="page-not-found-container">
      <FuzzyText
        baseIntensity={0.3}
        hoverIntensity={2}
        enableHover={true}
        fontFamily={`var(--font-satoshi)`}
        fontWeight={800}
        fontSize={"clamp(2rem, 10vw, 6rem)"}
        color={`var(--text)`}
      >
        404 Page Not Found
      </FuzzyText>
    </div>
  );
};

export default PageNotFound;
