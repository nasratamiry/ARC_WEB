import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Card from '../ui/Card'
import PageHeader from '../ui/PageHeader'
import SectionContainer from '../ui/SectionContainer'

type RoutePlaceholderProps = {
  title: string
}

function RoutePlaceholder({ title }: RoutePlaceholderProps) {
  return (
    <SectionContainer>
      <PageHeader
        eyebrow="ARC Design System"
        title={title}
        description="This route currently uses the shared design system components and spacing rules. Full page content will be added later."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <Badge>Reusable</Badge>
          <h2 className="mt-4 text-xl font-semibold text-arc-text">Consistent Foundations</h2>
          <p className="text-body mt-2">
            Buttons, cards, headers, and containers are unified for every route in the ARC corporate website.
          </p>
          <div className="mt-5 flex gap-3">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </Card>
      </div>
    </SectionContainer>
  )
}

export default RoutePlaceholder
