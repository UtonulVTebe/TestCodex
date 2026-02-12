import MainLayout from 'src/layouts/MainLayout.vue'
import LecturesPage from 'src/pages/LecturesPage.vue'
import ProgressPage from 'src/pages/ProgressPage.vue'
import LectureEditorPage from 'src/pages/LectureEditorPage.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        redirect: '/lectures'
      },
      {
        path: 'lectures',
        name: 'lectures',
        component: LecturesPage
      },
      {
        path: 'progress',
        name: 'progress',
        component: ProgressPage
      },
      {
        path: 'lectures/edit',
        name: 'lecture-editor',
        component: LectureEditorPage
      }
    ]
  }
]

export default routes
