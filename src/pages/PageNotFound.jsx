import { useNavigate } from "react-router-dom";
import SVGIcons from "../assets/icons/SVGIcons";
import FuzzyText from "../components/FuzzyText";
import "../css/pages/PageNotFound.css";

const PageNotFound = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="page-not-found-container">
        <FuzzyText
          baseIntensity={0.3}
          hoverIntensity={2}
          enableHover={true}
          fontFamily="var(--font-satoshi)"
          fontWeight={800}
          fontSize="6vw"
          color="var(--text)"
        >
          404 Page Not Found
        </FuzzyText>
        <div className="back-arrow" onClick={() => navigate("/")}>
          <SVGIcons.backArrow className="arrow" />
          <div>Simon Go Back</div>
        </div>
      </div>
    </>
  );
};

export default PageNotFound;
