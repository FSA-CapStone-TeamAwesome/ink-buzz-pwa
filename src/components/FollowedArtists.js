import React, { useEffect, useState, useCallback } from 'react';
import PreviewPost from './previewPost';
import { useSelector } from 'react-redux';
import { Heading } from '@chakra-ui/react';

const FollowedArtists = () => {
  const [following, setFollow] = useState([]);
  const followingState = useSelector((state) => state.following.following);

  //loader looks for user based on name, this will be changed to ID
  const loader = useCallback(() => {
    if (followingState[0] === undefined) {
      setFollow([]);
    }
    setFollow(followingState);
  }, [followingState]);

  useEffect(() => {
    loader();
  }, [followingState, loader]);

  if (!following[0]) {
    return (
      <Heading size="md" className="text-center">
        You currently aren't following anyone
      </Heading>
    );
  }

  return (
    <div>
      {following.map((coolDude) => {
        return (
          <div>
            <Heading className="text-center mb-2" size="xl">
              {coolDude.name}
            </Heading>
            <hr />

            {coolDude.images ? (
              <div className="d-flex flex-wrap align-items-start feedPostContainer">
                {coolDude.images.map((link, index) => {
                  if (index >= coolDude.images.length - 5) {
                    return (
                      <PreviewPost
                        key={index}
                        data={link}
                        creator={coolDude.name}
                      />
                    );
                  }
                })}
              </div>
            ) : (
              <></>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default FollowedArtists;
