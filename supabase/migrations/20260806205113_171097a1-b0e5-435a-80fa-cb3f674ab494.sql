ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS title_pt text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS description_pt text;

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS title_pt text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS description_pt text;

-- Courses
UPDATE public.courses SET title_en='MODULE 0 · Fundamentals', title_pt='MÓDULO 0 · Fundamentos',
 description_en='The concepts that change the way you look at your restaurant before touching a single number.',
 description_pt='Os conceitos que mudam a forma de olhar seu restaurante antes de mexer em um número.'
 WHERE title='MÓDULO 0 · Fundamentos';

UPDATE public.courses SET title_en='The Result Cycle', title_pt='Ciclo do Resultado',
 description_en='How the decisions that create (or destroy) the month''s result are chained together.',
 description_pt='Como se encadeiam as decisões que geram (ou destroem) o resultado do mês.'
 WHERE title='Ciclo del Resultado';

UPDATE public.courses SET title_en='MODULE 1 · Market Plan', title_pt='MÓDULO 1 · Plano de Mercado',
 description_en='Business diagnosis: SWOT, the venue and the partnership, with an editable file.',
 description_pt='Diagnóstico do negócio: SWOT, o ponto e a sociedade, com arquivo editável.'
 WHERE title='MÓDULO 1 · Plan de Mercado';

UPDATE public.courses SET title_en='MODULE 2 · Result Analysis', title_pt='MÓDULO 2 · Análise de Resultado',
 description_en='First Pillar: fixed costs, food cost (COGS) and the P&L spreadsheet step by step.',
 description_pt='Primeiro Pilar: gastos fixos, CMV e a Planilha DRE passo a passo.'
 WHERE title='MÓDULO 2 · Análisis de Resultado';

UPDATE public.courses SET title_en='MODULE 3 · Production Process', title_pt='MÓDULO 3 · Processo Produtivo',
 description_en='S.U.P. spreadsheet, yield factor, recipe cards and product ranking.',
 description_pt='Planilha S.U.P., fator de rendimento, fichas técnicas e ranking de produtos.'
 WHERE title='MÓDULO 3 · Proceso Productivo';

UPDATE public.courses SET title_en='MODULE 4 · Food Cost Allies', title_pt='MÓDULO 4 · Aliados do CMV',
 description_en='Inventory and Mise en Place: the tools that keep your food cost under control.',
 description_pt='Inventário e Mise en Place: as ferramentas que sustentam o custo de mercadoria.'
 WHERE title='MÓDULO 4 · Aliados del CMV';

UPDATE public.courses SET title_en='MODULE 5 · Financial Education', title_pt='MÓDULO 5 · Educação Financeira',
 description_en='Cash flow, financial masterclass and the complete e-book library.',
 description_pt='Fluxo de caixa, masterclass financeira e biblioteca completa de e-books.'
 WHERE title='MÓDULO 5 · Educación Financiera';

-- Lessons
UPDATE public.lessons SET title_en='Start here', title_pt='Comece aqui' WHERE title='Comienza aquí';
UPDATE public.lessons SET title_en='Having or Earning Money', title_pt='Ter ou Ganhar Dinheiro' WHERE title='Tener o Ganar Dinero';
UPDATE public.lessons SET title_en='Selling or Manufacturing', title_pt='Vender ou Fabricar' WHERE title='Vender o Fabricar';
UPDATE public.lessons SET title_en='Administering or Managing', title_pt='Administrar ou Gerir' WHERE title='Administrar o Gestionar';
UPDATE public.lessons SET title_en='From Entrepreneur to Business Owner', title_pt='De Empreendedor a Empresário' WHERE title='De Emprendedor a Empresario';
UPDATE public.lessons SET title_en='The Result Cycle', title_pt='Ciclo do Resultado' WHERE title='Ciclo del Resultado';

UPDATE public.lessons SET title_en='1.1 Market Plan — Introduction', title_pt='1.1 Plano de Mercado — Introdução' WHERE title='1.1 Plan de Mercado — Introducción';
UPDATE public.lessons SET title_en='1.2 S.W.O.T Analysis', title_pt='1.2 Análise S.W.O.T' WHERE title='1.2 Análisis F.O.D.A';
UPDATE public.lessons SET title_en='1.3 The Venue', title_pt='1.3 O Ponto' WHERE title='1.3 El Local';
UPDATE public.lessons SET title_en='1.4 The Partnership', title_pt='1.4 A Sociedade' WHERE title='1.4 La Sociedad';
UPDATE public.lessons SET title_en='1.5 Editable File', title_pt='1.5 Arquivo Editável',
 description_en='Practical class: download the editable Market Plan file and work on it on your computer.',
 description_pt='Aula prática: baixe o arquivo editável do Plano de Mercado e trabalhe nele no seu computador.'
 WHERE title='1.5 Archivo Editable';

UPDATE public.lessons SET title_en='2.1 Introduction', title_pt='2.1 Introdução' WHERE title='2.1 Introducción';
UPDATE public.lessons SET title_en='2.2 Fixed Costs', title_pt='2.2 Gastos Fixos' WHERE title='2.2 Gastos Fijos';
UPDATE public.lessons SET title_en='2.3 Food Cost (COGS)', title_pt='2.3 CMV' WHERE title='2.3 CMV';
UPDATE public.lessons SET title_en='2.4 P&L Spreadsheet 1', title_pt='2.4 Planilha DRE 1' WHERE title='2.4 Planilla DRE 1';
UPDATE public.lessons SET title_en='2.5 P&L Spreadsheet 2', title_pt='2.5 Planilha DRE 2' WHERE title='2.5 Planilla DRE 2';
UPDATE public.lessons SET title_en='2.6 Excel P&L Spreadsheet', title_pt='2.6 Planilha Excel DRE',
 description_en='Practical class: download the Excel P&L spreadsheet and fill it in with your restaurant''s data.',
 description_pt='Aula prática: baixe a Planilha Excel DRE para preencher com os dados do seu restaurante.'
 WHERE title='2.6 Planilla Excel DRE';

UPDATE public.lessons SET title_en='3.1 Introduction', title_pt='3.1 Introdução' WHERE title='3.1 Introducción';
UPDATE public.lessons SET title_en='3.2 S.U.P Spreadsheet I — Database', title_pt='3.2 Planilha S.U.P I — Banco de Dados' WHERE title='3.2 Planilla S.U.P I — Banco de Datos';
UPDATE public.lessons SET title_en='3.3 S.U.P Spreadsheet II — Yield Factor', title_pt='3.3 Planilha S.U.P II — Fator de Rendimento' WHERE title='3.3 Planilla S.U.P II — Factor de Rendimiento';
UPDATE public.lessons SET title_en='3.4 S.U.P Spreadsheet III — Recipe Cards', title_pt='3.4 Planilha S.U.P III — Fichas Técnicas' WHERE title='3.4 Planilla S.U.P III — Fichas Técnicas';
UPDATE public.lessons SET title_en='3.5 Product Ranking', title_pt='3.5 Ranking de Produtos' WHERE title='3.5 Ranking de Productos';
UPDATE public.lessons SET title_en='3.6 Product Ranking — Spreadsheet (Weighted Margin)', title_pt='3.6 Ranking de Produtos — Planilha (Margem Ponderada)' WHERE title='3.6 Ranking de Productos — Planilla (Margen Ponderado)';

UPDATE public.lessons SET title_en='4.1 Inventory I — Concepts and Introduction', title_pt='4.1 Inventário I — Conceitos e Introdução' WHERE title='4.1 Inventario I — Conceptos e Introducción';
UPDATE public.lessons SET title_en='4.2 Inventory II — Operational and Financial Role', title_pt='4.2 Inventário II — Função Operacional e Financeira' WHERE title='4.2 Inventario II — Función Operativa y Financiera';
UPDATE public.lessons SET title_en='4.3 Inventory III — Management Solutions', title_pt='4.3 Inventário III — Soluções na Gestão' WHERE title='4.3 Inventario III — Soluciones en la Gestión';
UPDATE public.lessons SET title_en='4.4 Inventory Spreadsheet', title_pt='4.4 Planilha de Inventário' WHERE title='4.4 Planilla de Inventario';
UPDATE public.lessons SET title_en='4.5 Mise en Place I — Introduction', title_pt='4.5 Mise en Place I — Introdução' WHERE title='4.5 Mise en Place I — Introducción';
UPDATE public.lessons SET title_en='4.6 Mise en Place II — Class', title_pt='4.6 Mise en Place II — Aula',
 description_en='Document class: download the material to read and apply Mise en Place in your operation.',
 description_pt='Aula em documento: baixe o material para ler e aplicar o Mise en Place na sua operação.'
 WHERE title='4.6 Mise en Place II — Aula';
UPDATE public.lessons SET title_en='4.7 Mise en Place III — Checklist', title_pt='4.7 Mise en Place III — Checklist',
 description_en='Practical class: download the Mise en Place checklist spreadsheet.',
 description_pt='Aula prática: baixe a planilha de checklist de Mise en Place.'
 WHERE title='4.7 Mise en Place III — Checklist';
UPDATE public.lessons SET title_en='4.8 Excel Spreadsheet — Food Cost Allies', title_pt='4.8 Planilha Excel — Aliados do CMV' WHERE title='4.8 Planilla Excel — Aliados del CMV';

UPDATE public.lessons SET title_en='5.1 Cash Flow', title_pt='5.1 Fluxo de Caixa',
 description_en='Two videos: spreadsheet walkthrough and the full Cash Flow class.',
 description_pt='Dois vídeos: apresentação da planilha e a aula completa de Fluxo de Caixa.'
 WHERE title='5.1 Flujo de Caja';
UPDATE public.lessons SET title_en='5.2 Financial Education Masterclass', title_pt='5.2 Masterclass Educação Financeira' WHERE title='5.2 Masterclass Educación Financiera';
UPDATE public.lessons SET title_en='5.3 YouTube Classes', title_pt='5.3 Aulas do YouTube',
 description_en='List of complementary classes available on YouTube. Links are added here.',
 description_pt='Lista de aulas complementares disponíveis no YouTube. Os links são adicionados aqui.'
 WHERE title='5.3 Aulas de YouTube';
UPDATE public.lessons SET title_en='5.4 E-Books I', title_pt='5.4 E-Books I',
 description_en='First e-book library of the GPS Method.',
 description_pt='Primeira biblioteca de e-books do Método GPS.'
 WHERE title='5.4 E-Books I';
UPDATE public.lessons SET title_en='5.5 E-Books II', title_pt='5.5 E-Books II',
 description_en='Second e-book library of the GPS Method.',
 description_pt='Segunda biblioteca de e-books do Método GPS.'
 WHERE title='5.5 E-Books II';