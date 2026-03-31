import { StoryProvider } from '../store/StoryContext';
import { ComicScene } from '../components/story/ComicScene';
import { StoryOverlay } from '../components/story/StoryOverlay';

const Index = () => {
  return (
    <StoryProvider>
      <div className="w-screen h-screen overflow-hidden bg-foreground p-2 md:p-4">
        <div className="relative w-full h-full">
          <ComicScene />
          <StoryOverlay />
        </div>
      </div>
    </StoryProvider>
  );
};

export default Index;
