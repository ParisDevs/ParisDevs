import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import './landing.css'

const NAV = [
  { href: '#inicio', id: 'inicio', label: 'Início' },
  { href: '#funcionalidades', id: 'funcionalidades', label: 'Funcionalidades' },
  { href: '#beneficios', id: 'beneficios', label: 'Benefícios' },
  { href: '#sobre', id: 'sobre', label: 'Sobre nós' },
]

function Arrow() {
  return (
    <svg className="arr" viewBox="0 0 16 16" aria-hidden>
      <path d="M2 8h12M9 3l5 5-5 5" />
    </svg>
  )
}

export function LandingPage() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('inicio')
  const enterTo = '/login'

  useEffect(() => {
    const root = document.documentElement
    const prevTheme = root.dataset.theme
    const prevTitle = document.title
    const prevPad = root.style.scrollPaddingTop
    root.classList.add('scroll-smooth')
    root.style.scrollPaddingTop = '90px'
    delete root.dataset.theme
    document.title = 'Paris Devs | Sistema de gestão financeira'
    return () => {
      root.classList.remove('scroll-smooth')
      root.style.scrollPaddingTop = prevPad
      if (prevTheme) root.dataset.theme = prevTheme
      document.title = prevTitle
    }
  }, [])

  function go(id) {
    setActive(id)
    setOpen(false)
  }

  return (
    <div className="lp">
      <header>
        <div className="wrap nav">
          <a className="logo" href="#inicio" aria-label="Paris Devs" onClick={() => go('inicio')}>
            PARIS DEVS
          </a>
          <nav aria-label="Principal">
            <ul className="desk">
              {NAV.map((item) => (
                <li key={item.id}>
                  <a className={active === item.id ? 'on' : undefined} href={item.href} onClick={() => go(item.id)}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Link className="btn btn-o" to={enterTo}>
            Acessar sistema <Arrow />
          </Link>
          <button type="button" className="burger" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen((v) => !v)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        <div className={open ? 'mobile open' : 'mobile'}>
          {NAV.map((item) => (
            <a key={item.id} href={item.href} onClick={() => go(item.id)}>
              {item.label}
            </a>
          ))}
          <Link className="btn btn-o" to={enterTo} onClick={() => setOpen(false)}>
            Acessar sistema <Arrow />
          </Link>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="city" aria-hidden>
            <i style={{ right: '2%', width: '15%', height: '92%' }} />
            <i style={{ right: '18%', width: '11%', height: '70%' }} />
            <i style={{ right: '30%', width: '9%', height: '50%' }} />
            <i style={{ right: '40%', width: '12%', height: '38%' }} />
            <i style={{ right: '6%', width: '9%', height: '58%', opacity: 0.7 }} />
          </div>
          <div className="arc" aria-hidden />
          <div className="wrap">
            <div>
              <p className="kicker">Sistema de gestão financeira</p>
              <h1>
                Mais controle, melhores decisões para o seu <em>negócio.</em>
              </h1>
              <p className="lead">
                O Paris Devs é uma solução completa para gestão financeira empresarial, que integra suas contas, concilia seus dados e gera informações estratégicas em tempo real.
              </p>
              <div className="cta">
                <Link className="btn btn-g" to={enterTo}>
                  Começar agora <Arrow />
                </Link>
                <a className="play" href="#funcionalidades" onClick={() => go('funcionalidades')}>
                  Conheça o sistema
                  <span>
                    <svg viewBox="0 0 10 10" aria-hidden>
                      <path d="M1 0l9 5-9 5z" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
            <LaptopMock />
          </div>
        </section>

        <section className="feat" id="funcionalidades">
          <div className="wrap">
            <div>
              <p className="eyebrow">Funcionalidades</p>
              <h2>Tudo o que você precisa em um só lugar.</h2>
              <p className="sub">Simplifique sua rotina financeira com ferramentas intuitivas, seguras e pensadas para o seu dia a dia.</p>
              <Link className="btn btn-l" to={enterTo}>
                Ver todas as funcionalidades <Arrow />
              </Link>
            </div>
            <div className="grid">
              <Feature
                title="Conciliação bancária"
                text="Integração automática com seus bancos e conciliação em tempo real."
                path="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"
              />
              <Feature
                title="Contas a pagar e receber"
                text="Organize seus compromissos e evite atrasos com alertas inteligentes."
                path="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5"
              />
              <Feature
                title="Relatórios gerenciais"
                text="Tenha visibilidade total do seu fluxo de caixa e DRE com relatórios completos."
                path="M4 20V14h3v6zM10.5 20V8h3v12zM17 20V4h3v16z"
              />
              <Feature
                title="Segurança de dados"
                text="Seus dados protegidos com tecnologia de ponta e acesso por múltiplos níveis."
                path="M12 3l8 3v6c0 4.5-3.3 7.8-8 9-4.7-1.2-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5"
              />
              <Feature
                title="Acesso de qualquer lugar"
                text="Use o sistema de onde estiver, no computador ou no celular."
                path="M7 18a4.5 4.5 0 01-.5-9A6 6 0 0118 10a4 4 0 01-.5 8z"
              />
              <Feature
                title="Integrações e automações"
                text="Conecte com seus sistemas favoritos e ganhe mais produtividade."
                path="M13 2L5 14h6l-1 8 8-12h-6z"
              />
            </div>
          </div>
        </section>

        <section className="why" id="beneficios">
          <div className="wrap">
            <div>
              <p className="eyebrow">Por que escolher o Paris Devs?</p>
              <h2>
                Tecnologia, segurança e um suporte <em>próximo.</em>
              </h2>
            </div>
            <div className="stats">
              <div className="st">
                <svg viewBox="0 0 32 32" fill="none" strokeLinejoin="round" aria-hidden>
                  <path d="M5 28V6h10v22M15 12h12v16M3 28h26M9 11h2M9 16h2M9 21h2M20 17h3M20 22h3" />
                </svg>
                <strong>100%</strong>
                <span>
                  Confiabilidade
                  <br />
                  nos seus dados
                </span>
              </div>
              <div className="st">
                <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" aria-hidden>
                  <circle cx="16" cy="16" r="12" />
                  <path d="M16 8v8l5 3" />
                </svg>
                <strong>+80%</strong>
                <span>
                  de agilidade
                  <br />
                  nos processos
                </span>
              </div>
              <div className="st">
                <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" aria-hidden>
                  <path d="M6 20v-4a10 10 0 0120 0v4M5 18h3v7H5zM24 18h3v7h-3zM24 25c0 2-3 3-7 3" />
                </svg>
                <strong>Suporte</strong>
                <span>
                  especializado
                  <br />e humanizado
                </span>
              </div>
            </div>
            <blockquote id="sobre">
              “Mais do que um sistema, somos o seu parceiro na jornada de crescimento.”
              <cite>PARIS DEVS</cite>
            </blockquote>
          </div>
        </section>
      </main>
      <footer>© 2026 Paris Devs. Todos os direitos reservados.</footer>
    </div>
  )
}

function Feature({ title, text, path }) {
  return (
    <div className="it">
      <div className="ic">
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d={path} />
        </svg>
      </div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  )
}

function LaptopMock() {
  return (
    <div className="laptop" role="img" aria-label="Painel do sistema Paris Devs com saldo, entradas, saídas e fluxo de caixa">
      <div className="screen">
        <div className="app">
          <div className="side">
            <b>PARIS DEVS</b>
            <span className="a">Dashboard</span>
            <span>Contas a pagar</span>
            <span>Contas a receber</span>
            <span>Conciliação</span>
            <span>Extratos</span>
            <span>Relatórios</span>
            <span>Configurações</span>
          </div>
          <div className="main">
            <div className="top">
              <span className="pill">Setembro de 2026</span>
              <span>Ana</span>
            </div>
            <h4>Olá, Ana!</h4>
            <p>Aqui você encontra um resumo completo da sua movimentação financeira.</p>
            <div className="kp">
              <div>
                <small>Saldo bancário consolidado</small>
                <strong>R$ 471.990,85</strong>
                <u>2 contas sem saldo disponível</u>
              </div>
              <div>
                <small>Entradas do período</small>
                <strong>R$ 178.271,55</strong>
                <u>↑ 231,4% vs ago/26</u>
              </div>
              <div>
                <small>Saídas do período</small>
                <strong>R$ 217.460,62</strong>
                <u className="r">↑ 1576,6% vs ago/26</u>
              </div>
              <div>
                <small>Contas a receber</small>
                <strong>R$ 42.339,07</strong>
                <u className="r">DRE classificada · set/26</u>
              </div>
              <div>
                <small>Contas a pagar</small>
                <strong>R$ 0,00</strong>
                <u>2026-10-02</u>
              </div>
              <div>
                <small>Pendentes de conciliação</small>
                <strong>9</strong>
                <u>R$ 35.460,30</u>
              </div>
            </div>
            <div className="chart">
              <small>Fluxo de caixa</small>
              <div className="bars">
                <i style={{ height: '30%' }} />
                <i style={{ height: '12%' }} />
                <i style={{ height: '55%' }} />
                <i style={{ height: '14%' }} />
                <i style={{ height: '40%' }} />
                <i style={{ height: '18%' }} />
                <i style={{ height: '62%' }} />
                <i style={{ height: '20%' }} />
                <i style={{ height: '48%' }} />
                <i style={{ height: '16%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="base" />
    </div>
  )
}
