"use client"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs } from '@/components/ui/tabs';
import { FC, Suspense, useState } from 'react'
import MessagesContainer from '../components/message-container';
import { Fragment } from '@/generated/prisma';
import { ProjectHeader } from '../components/project-header';
import { FragmentWeb } from '../components/fragment-web';

interface viewProps {
  projectId : string
}

const ProjectView: FC<viewProps> = ({projectId}) => {
    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);

  return <div>
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col min-h-0"
        >
           <Suspense fallback={<div>Loading project...</div>}>
            <ProjectHeader projectId={projectId} />
          </Suspense>
          {/* <ErrorBoundary fallback={<p> Lỗi container tin nhắn</p>}> */}
          <Suspense fallback={<div>Loading Messages...</div>}>
            <MessagesContainer
              projectId={projectId}
              activeFragment={activeFragment}
              setActiveFragment={setActiveFragment}
            />
          </Suspense>
          {/* </ErrorBoundary> */}
        </ResizablePanel>
        <ResizableHandle className="hover:bg-primary transition-colors" />
        <ResizablePanel defaultSize={65} minSize={50}>
          {!!activeFragment && <FragmentWeb data={activeFragment} />}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  </div>
}

export default ProjectView;