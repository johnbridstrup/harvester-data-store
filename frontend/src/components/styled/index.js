import styled from "styled-components";


export const SpanLimit = styled.span`
  margin-left: 2rem;
  margin-right: 1rem;
  color: #6c757d
`;

export const InputLimit = styled.input`
  width: 25%;
  padding: 0.375rem 0.75rem;
  color: #6c757d;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
`;

export const PageItem = styled.li`
  display: flex;
  align-items: center;
`;

export const Container = styled.div`
  margin-top: 3rem;
  margin-bottom: 1rem
`;

export const LoaderDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 25vh
`;

export const Table = styled.table``;


export const DivTotalReport = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  & span {
    font-size: 1.6rem;
    margin-right: .5rem;
  }
`;


export const InputFormControl = styled.input`
  display: block;
  width: 90%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 0.375rem;
  transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;

  @media (max-width: 768px) {
    width: 100%;
  }

`;


export const ClipboardDiv = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: .5rem;
`;