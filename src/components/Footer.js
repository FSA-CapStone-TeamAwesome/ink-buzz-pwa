import { Heading } from '@chakra-ui/react';
import React from 'react';

const Footer = () => {
  return (
    <footer className="page-footer font-small blue pt-4 mb-5 mobile-footer">
      <div className="container-fluid text-center">
        <div className="row d-flex justify-content-center">
          {/* <div className="col-md-3 mt-md-0 mt-3"> */}
          <Heading size="sm" className="text-uppercase mb-3">
            Ink Buzz was created in 20 days by:
          </Heading>
          {/* </div> */}

          <hr className="clearfix w-100 d-md-none my-3" />

          <div className="col-md-2 mb-md-0 mb-3">
            <img src="/images/alec.webp" alt="alec eiber" />
            <Heading size="sm" className="text-uppercase mt-2">
              <a href="https://www.aleceiber.com">Alec Eiber</a>
            </Heading>
            <ul className="list-unstyled">
              <li>
                <a href="https://www.linkedin.com/in/aleceiber">LinkedIn</a>
              </li>
              <li>
                <a href="https://www.github.com/a-eiber">GitHub</a>
              </li>
            </ul>
          </div>

          <div className="col-md-2 mb-md-0 mb-3">
            <img src="/images/don.webp" alt="don romaniello" />
            <Heading size="sm" className="text-uppercase mt-2">
              Don Romaniello
            </Heading>
            <ul className="list-unstyled">
              <li>
                <a href="https://www.linkedin.com/in/don-romaniello/">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="https://github.com/DonRomaniello">GitHub</a>
              </li>
            </ul>
          </div>

          <div className="col-md-2 mb-md-0 mb-3">
            <img src="/images/jacob.webp" alt="jacob shivers" />
            <Heading size="sm" className="text-uppercase mt-2">
              Jacob Shivers
            </Heading>
            <ul className="list-unstyled">
              <li>
                <a href="https://www.linkedin.com/in/jacob-shivers/">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="https://github.com/jtshivers">GitHub</a>
              </li>
            </ul>
          </div>

          <div className="col-md-2 mb-md-0 mb-3">
            <img src="/images/james.webp" alt="james carmody" />
            <Heading size="sm" className="text-uppercase mt-2">
              James Carmody
            </Heading>
            <ul className="list-unstyled">
              <li>
                <a href="https://www.linkedin.com/in/james-carmody-393312238/">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="https://github.com/JRC91">GitHub</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
    // <div className="bg-dark p-3 text-white mt-5 position-relative-bottom">
    //   <Heading as="h5" size="sm" mb={2}>
    //     Ink Buzz was created by:
    //   </Heading>
    //   <a href="https://www.linkedin.com/in/aleceiber">Alec Eiber</a>,{' '}
    //   <a href="https://www.linkedin.com/in/don-romaniello/">Don Romaniello</a>,{' '}
    //   <a href="https://www.linkedin.com/in/jacob-shivers/">Jacob Shivers</a>,{' '}
    //   and{' '}
    //   <a href="https://www.linkedin.com/in/james-carmody-393312238/">
    //     James Carmody
    //   </a>
    // </div>
  );
};

export default Footer;
